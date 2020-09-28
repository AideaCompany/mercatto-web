import React,{useEffect,useState} from 'react'
//next
import Link from 'next/link'
import {useRouter} from 'next/router'
//components
import Layout from '../components/Layout';
//antd
import { Modal ,Form, Button, message, Input, Checkbox} from 'antd';
import {ArrowLeftOutlined,ShoppingCartOutlined,DeleteOutlined } from '@ant-design/icons';
//context
import useAuth from '../providers/AuthProvider'
//types
import {Carrito, Producto} from '../utils/types'
//axios
import axios from 'axios'
//utils
import {getNewPrice} from '../utils/functions'
//Gsap
import { TimelineMax, gsap,  CSSPlugin, Power4} from 'gsap'

const {TextArea} = Input

type showCarrito = Carrito & {totalPrecio?:number,precio?:number,peso?:string}

const background = "#fff"

const carrito = (props:{url:string}):JSX.Element=>{
    const {url} = props
    const [actualCart, setactualCart] = useState<showCarrito[]>()
    const [totalPrice, settotalPrice] = useState<Number>(0)
    const [modalVisible, setmodalVisible] = useState<boolean>(false)
    const [toDelete, settoDelete] = useState<number>()
    const [direccion, setDireccion] = useState<string>('')
    const [Observaciones, setObservaciones] = useState<string>('')
    const [saveLocation, setSaveLocation] = useState(false)

    
    //context
    const {user,updateUser} = useAuth()
    
    //router
    const router = useRouter()


    useEffect(() => {
        if (user.direccion !== '') {
            setDireccion(user.direccion)
        }
        gsap.registerPlugin(CSSPlugin)
        const actual:showCarrito[] = user?.carrito
        actual?.map(e=>{
            (e.producto as Producto).precioDescuento = getNewPrice((e.producto as Producto).descuento,(e.producto as Producto).precio) 
            e.totalPrecio=e.cantidad*((e.producto) as Producto).precio
            e.precio = getNewPrice((e.producto as Producto).descuento,e.totalPrecio)    
            e.peso = (e.producto as Producto).peso
        })
        settotalPrice(actual?actual.map(e=>e.precio).reduce((a,b)=>a+b,0):0)
        setactualCart(actual?actual:[])
    }, [user])

    //functions
    const divWrapper =  (state: string) => {
        const t1 = new TimelineMax({paused: true})
        if (state === 'open') {
            t1.to('.confirmCart', 0.5 , {opacity: 1 , top: '60vh', ease: Power4.easeInOut}).play()
        }else{
            t1.to('.confirmCart', 0.5 , {opacity: 0, top: '100vh', ease: Power4.easeInOut}).play()
        }
    }

    const plus= (pos)=>{
        actualCart[pos].cantidad +=1
        actualCart?.map(e=>{
            (e.producto as Producto).precioDescuento = getNewPrice((e.producto as Producto).descuento,(e.producto as Producto).precio) 
            e.totalPrecio=e.cantidad*((e.producto) as Producto).precio
            e.precio = getNewPrice((e.producto as Producto).descuento,e.totalPrecio)            
            e.peso = (e.producto as Producto).peso
        })
        settotalPrice(actualCart?.map(e=>e.precio).reduce((a,b)=>a+b,0))
        setactualCart([...actualCart])
    }

    const minus = (pos)=>{
        if(actualCart[pos].cantidad>1){
            actualCart[pos].cantidad -=1
            actualCart?.map(e=>{
                (e.producto as Producto).precioDescuento = getNewPrice((e.producto as Producto).descuento,(e.producto as Producto).precio) 
                e.totalPrecio=e.cantidad*((e.producto) as Producto).precio
                e.precio = getNewPrice((e.producto as Producto).descuento,e.totalPrecio)            
                e.peso = (e.producto as Producto).peso
            })
            settotalPrice(actualCart?.map(e=>e.precio).reduce((a,b)=>a+b,0))
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
            carrito:(actualCart as Carrito[]),
            Terminado:false
        }) 
        axios.put(`${url}/users/${user._id}`,{
            carrito: [],
            direccion: saveLocation ? direccion : user.direccion,
            Pedidos:user.pedidos}, {
            headers: {
                Authorization: `Bearer ${user.jwt}`
            }
        }).then(res=>{  
            var carrito = actualCart.map(e=>{
                return ({
                    cantidad: e.cantidad,
                    producto: (e.producto as Producto).nombre,
                    precio : e.precio,
                    peso: e.peso
                })
            })
            axios.post(`${url}/pedidos`,{
                Carrito: carrito,
                user: user._id ,
                Entregado: false,
                direccion: direccion,
                telefono_cliente: user.telefono ? user.telefono : '',
                observaciones: Observaciones
                }, {
                headers: {
                    Authorization: `Bearer ${user.jwt}`
                }
            }).then(rpt=>{ 
                updateUser(res);
                message.success({content:"Pedido realizado",className: 'messageVerification',duration: '5'})
                router.push("/pedidos")
            }).catch(err=>console.log(err))
        }).catch(err=>console.log(err))
    }
    return (
        <>
    <Layout urlBack={url}  logoWhite={false} pathPublic={'../../'} title={"Carrito"} color={"#8D8D8D"}  background={"#EEEEEE"}>
            <div className='carritoMain'>
                <div className='carritoLeft'>
                    <ShoppingCartOutlined />

                    <span  onClick={()=>router.back()} style={{color: "#8D8D8D", cursor:'pointer'}}
                        className='backArrow'>
                        <ArrowLeftOutlined />
                    </span>
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
                                    <div className="price">
                                    {(e.producto as Producto).descuento> 0 ? <span className='productDescuento'><span className={"sub"}>{`$${e.totalPrecio}`}</span><span style={{textDecoration:"none"}}>{`  ${(e.producto as Producto).descuento}%OFF`}</span></span> : null }
                                        {`$${e.precio}`}
                                        </div>
                                    <div className="functions">
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
                        <div className='confirmCart'>
                            <div className='info'>
                                <Input value={direccion} placeholder='Dirección' onChange={(e)=>setDireccion(e.target.value)}></Input>
                                <Checkbox checked={saveLocation} onChange={()=>setSaveLocation(!saveLocation)}>Guardar Dirección para futuras compras</Checkbox>
                                <TextArea style={{resize: 'none'}} placeholder='Observaciones' onChange={(e)=>setObservaciones(e.target.value)}></TextArea>
                            </div>
                            <div className='buttons'>
                                <span>Total: ${totalPrice}</span>
                                <br/>
                                <div>
                                    <button onClick={()=>divWrapper('close')} type="button" className="btn btn-primary btn-lg">
                                        Cancelar
                                    </button>
                                    <button onClick={okCart} type="button" className="btn btn-primary btn-lg">
                                        Realizar pedido
                                    </button>
                                </div>
                                
                            </div>
                        </div>
                    :null}
                    {actualCart?.length>0?                    
                    <div className="totals">
                        <span className="value">
                            {`Total:$${totalPrice}`}
                        </span>
                        <button onClick={()=>divWrapper('open')} className='btn btn-primary btn-lg'>
                            Aceptar
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
    return {props: {url:URL}}
}
export default React.memo(carrito)