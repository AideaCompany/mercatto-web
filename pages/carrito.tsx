import React,{useEffect,useState} from 'react'
//next
import Link from 'next/link'
import {useRouter} from 'next/router'
//components
import Layout from '../components/Layout';
//antd
import {ArrowLeftOutlined,ShoppingCartOutlined,DeleteOutlined } from '@ant-design/icons';
//context
import useAuth from '../providers/AuthProvider'
//types
import {Carrito, Producto} from '../utils/types'
import { Modal ,Form, Button, message} from 'antd';
//axios
import axios from 'axios'

type showCarrito = Carrito & {totalPrecio?:number}

const carrito = (props:{url:string}):JSX.Element=>{
    const {url} = props
    const [actualCart, setactualCart] = useState<showCarrito[]>()
    const [totalPrice, settotalPrice] = useState<Number>(0)
    const [modalVisible, setmodalVisible] = useState<boolean>(false)
    const [toDelete, settoDelete] = useState<number>()
    const background = "#e5f5ff"
      //context
      const {user,updateUser} = useAuth()
    //router
    const router = useRouter()

    useEffect(() => {
        const actual:showCarrito[] = user?.carrito
        actual?.map(e=>e.totalPrecio=e.cantidad*((e.producto) as Producto).precio)
        settotalPrice(actual?actual.map(e=>e.totalPrecio).reduce((a,b)=>a+b,0):0)
        setactualCart(actual?actual:[])
    }, [user])
    //functions
    const plus= (pos)=>{
        actualCart[pos].cantidad +=1
        actualCart?.map(e=>e.totalPrecio=e.cantidad*((e.producto) as Producto).precio)
        settotalPrice(actualCart?.map(e=>e.totalPrecio).reduce((a,b)=>a+b,0))
        setactualCart([...actualCart])
    }

    const minus = (pos)=>{
        if(actualCart[pos].cantidad>1){
            actualCart[pos].cantidad -=1
            actualCart?.map(e=>e.totalPrecio=e.cantidad*((e.producto) as Producto).precio)
            settotalPrice(actualCart?.map(e=>e.totalPrecio).reduce((a,b)=>a+b,0))
            setactualCart([...actualCart])
        }else{
            settoDelete(pos)
            setmodalVisible(true);
        }

    }

    const HandleClose = ()=>{
        setmodalVisible(false)
        Modal.destroyAll()
    }

    const deleteItem = ()=>{
        actualCart.splice(toDelete,1)
        setactualCart([...actualCart])
        setmodalVisible(false)
        settoDelete(null)
        axios.put(`${url}/users/${user._id}`,{
            carrito:actualCart}, {
            headers: {
                Authorization: `Bearer ${user.jwt}`
            }
        }).then(res=>{  
            updateUser(res);
            message.success({content:"Producto eliminado",className: 'messageVerification',duration: '5'})
        }).catch(err=>console.log(err))
    }
    const okCart = ()=>{
        actualCart.map(e=>{delete e._id;delete e.id})
        user.pedidos.push({
            carrito:actualCart as Carrito[],
            Terminado:false
        }) 
        axios.put(`${url}/users/${user._id}`,{
            carrito: [],
            Pedidos:user.pedidos}, {
            headers: {
                Authorization: `Bearer ${user.jwt}`
            }
        }).then(res=>{  
            var carrito = actualCart.map(e=>{
                return ({
                    Cantidad: e.cantidad,
                    Producto: (e.producto as Producto).nombre
                })
            })
            axios.post(`${url}/pedidos`,{
                Carrito: carrito,
                user: user._id ,
                Entregado: false
                }, {
                headers: {
                    Authorization: `Bearer ${user.jwt}`
                }
            }).then(rpt=>{ 
                updateUser(res);
                message.success({content:"Pedido realizado",className: 'messageVerification',duration: '5'})
                // router.push("/pedidos")
            }).catch(err=>console.log(err))
        }).catch(err=>console.log(err))
    }
    return (
        <>
    <Layout urlBack={url}  logoWhite={false} pathPublic={'../../'} title={"Carrito"} color={"#8D8D8D"}  background={"#EEEEEE"}>
            <div className='carritoMain'>
                <div className='carritoLeft'>
                    <ShoppingCartOutlined />

                    <a onClick={()=>router.back()} style={{color: "#8D8D8D"}}
                        className='backArrow'>
                        <ArrowLeftOutlined />
                    </a>
                </div>
                <div className="carritoRight">
                    <h2 style={{paddingLeft:"5%"}}>{actualCart?.length>0?"Lista de productos:":null}</h2>
                    <div className='carrito'>
                        <div className="targetSubCategory">
                            {actualCart?.length>0?actualCart?.map((e,i)=>{
                            return (
                            <div className="productItem" style={{background:background}}>
                                <div className="image">
                                    <img src={`${url}${((e.producto) as Producto).imagenes.url}`} alt={`${((e.producto) as Producto).nombre}
                                        mercatto`} />
                                </div>
                                <div className="titulo">
                                    <h2 style={{color:"#787878"}}>{((e.producto) as Producto).nombre}</h2>
                                    <span style={{color:"#787878"}}>{((e.producto)as Producto).descripcion}</span>
                                </div>
                                <div className="simbols">
                                    <div className="price">{`$${e.totalPrecio}`}</div>
                                    <button onClick={()=>minus(i)} className="circle">
                                        -
                                    </button>
                                    <div className="number">
                                        {e.cantidad}
                                    </div>
                                    
                                    <button onClick={()=>plus(i)} className="circle">
                                        +
                                    </button>
                                    <DeleteOutlined onClick={()=>{settoDelete(i);setmodalVisible(true)}} className='iconDelete'/>
                                </div>

                            </div>
                            )
                            }):
                            <div className="emptyCart">
                                <h2>Tu carrito está vacio:(</h2>
                                <Link href='/'>
                                    <a>
                                        Regresa para comprar
                                    </a>
                                </Link>
                                <img src={'./images/Layout/empty-cart.svg'} />

                            </div>
                            }
                        </div>
                    </div>
                    {actualCart?.length>0?                    
                    <div className="totals">
                        <span className="value">
                            {`Total:$${totalPrice}`}
                        </span>
                        <button onClick={okCart} type="button" className="btn btn-primary btn-lg">
                            Realizar pedido
                        </button>
                    </div>:null}

                </div>
            </div>
    </Layout>
    <Modal centered onCancel={HandleClose} visible={modalVisible}>
        {actualCart?
        <div className='containerForm'>
            <h2>{`¿Deseas eliminar el producto ${(actualCart[toDelete]?.producto as Producto)?.nombre}?`}</h2>
            <div className="image">
            <img src={`${url}${(actualCart[toDelete]?.producto as Producto)?.imagenes.url}`} alt={`${(actualCart[toDelete]?.producto as Producto)?.nombre}mercatto`} />   

            </div>
             <Form name='signIn' onFinish={deleteItem}>
                        <div className='buttonsAuth'>
                            <Button htmlType="submit">Aceptar</Button>
                            <Button onClick={HandleClose}>Cancelar</Button>
                        </div>
            </Form>
        </div>:null}
    </Modal>
    </>
    )
}
export async function getServerSideProps (ctx) {
    const URL = process.env.URL_STRAPI;
    // const dataSubCategory = await fetch(`${URL}/sub-categorias?only=${ctx.query.id}`,{method: 'GET'})
    // const jsonSubcategory = await dataSubCategory.json()
    // const dataProducts = await fetch(`${URL}/productos?id_sub_category=${ctx.query.id}`,{method: 'GET'})
    // const jsonProducts = await dataProducts.json()
    // const contrast = ctx.query.contrast === "true" ? true : false
    return {props: {url:URL,/*  contrast: contrast, background: ctx.query.background} */}}
}
export default React.memo(carrito)