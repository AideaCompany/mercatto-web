import React,{useEffect,useState} from 'react'
//next
import Link from 'next/link'
import {useRouter} from 'next/router'
//components
import Layout from '../components/Layout';
//antd
import { Modal ,Form, Button, message, Input, Checkbox} from 'antd';
import { CloseOutlined , CheckCircleTwoTone, WarningTwoTone} from '@ant-design/icons';
//context
import useAuth from '../providers/AuthProvider'
//types
import {Carrito, Producto, ProductoCombo} from '../utils/types'
//axios
import axios from 'axios'
//utils
import {getNewPrice, formatNumber} from '../utils/functions'
//Gsap
import { TimelineMax, gsap,  CSSPlugin, Power4} from 'gsap'


const {TextArea} = Input

type showCarrito = Carrito & {totalPrecio?:number,precio?:number,peso?:string}


const carrito = (props:{url:string}):JSX.Element=>{
    const {url} = props
    const [actualCart, setactualCart] = useState<showCarrito[]>()
    const [totalPrice, settotalPrice] = useState<number>(0)
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
        if (user.direccion !== '' || !user.direccion ) {
            setDireccion(user.direccion)
        }
        gsap.registerPlugin(CSSPlugin)
        var actual:showCarrito[] = user?.carrito
        actual?.map(e=>{
            if (e!==null) {
                if (e?.combo) {
                    (e?.combo as ProductoCombo).precioDescuento = getNewPrice(0,(e?.combo as ProductoCombo)?.precio) 
                    e.totalPrecio=e.cantidad*((e.combo) as ProductoCombo).precio
                    e.precio = getNewPrice(0,e.totalPrecio)  
                }else{
                    (e?.producto as Producto).precioDescuento = getNewPrice((e?.producto as Producto)?.descuento,(e?.producto as Producto)?.precio)
                    e.totalPrecio=e.cantidad*((e.producto) as Producto).precio 
                    e.precio = getNewPrice((e.producto as Producto).descuento,e.totalPrecio)  
                    e.peso = (e.producto as Producto).peso
                }
            }    
        })
        for (let k = 0; k < actual?.length; k++) {
            if (actual[k]?.combo) {
                var combo = ((actual[k]?.combo as ProductoCombo)?.producto as ProductoCombo[])
                var tempDes = []
                for (let m = 0; m < combo.length; m++) {
                    tempDes.push(`${(combo[m]?.producto as Producto).nombre} x${combo[m]?.cantidad}`)
                }
                (actual[k]?.combo as ProductoCombo).descripcion = tempDes.join(', ')
            }
            
        }
        settotalPrice(actual?actual.map(e=>e.precio).reduce((a,b)=>a+b,0):0)
        setactualCart(actual?actual:[])
    }, [user])

    //functions
    const vaciarCarrito =  () => {
        setactualCart([])
    }

    useEffect(() => {
        updateCart()
    }, [actualCart])

    const plus= async (pos)=>{
        actualCart[pos].cantidad +=1
        actualCart?.map(e=>{
            if (e?.combo) {
                (e?.combo as ProductoCombo).precioDescuento = getNewPrice(0,(e?.combo as ProductoCombo).precio) 
                e.totalPrecio=e.cantidad*((e?.combo) as ProductoCombo).precio
                e.precio = getNewPrice(0,e?.totalPrecio)  
            }else{
                (e.producto as Producto).precioDescuento = getNewPrice((e?.producto as Producto).descuento,(e?.producto as Producto).precio) 
                e.totalPrecio=e.cantidad*((e?.producto) as Producto)?.precio
                e.precio = getNewPrice((e?.producto as Producto).descuento,e?.totalPrecio)            
                e.peso = (e?.producto as Producto)?.peso
            }

        })
        settotalPrice(actualCart?.map(e=>e?.precio).reduce((a,b)=>a+b,0))
        setactualCart([...actualCart])
    }

    const minus = async (pos)=>{
        if(actualCart[pos].cantidad>1){
            actualCart[pos].cantidad -=1
            actualCart?.map(e=>{
                if (e?.combo) {
                    (e?.combo as ProductoCombo).precioDescuento = getNewPrice(0,(e?.combo as ProductoCombo)?.precio) 
                    e.totalPrecio=e.cantidad*((e?.combo) as ProductoCombo)?.precio
                    e.precio = getNewPrice(0,e?.totalPrecio)  
                }else{
                    (e?.producto as Producto).precioDescuento = getNewPrice((e?.producto as Producto)?.descuento,(e?.producto as Producto)?.precio) 
                    e.totalPrecio=e?.cantidad*((e?.producto) as Producto)?.precio
                    e.precio = getNewPrice((e?.producto as Producto)?.descuento,e?.totalPrecio)            
                    e.peso = (e?.producto as Producto)?.peso
                }
            })
            settotalPrice(actualCart?.map(e=>e?.precio).reduce((a,b)=>a+b,0))
            setactualCart([...actualCart])
        }else{
            settoDelete(pos)
            setmodalVisible(true);
        }
    }

    const updateCart = async () =>{
        await axios.put(`${url}/users/${user._id}`,{
            carrito:actualCart
        },{
            headers:{
                Authorization: `Bearer ${user.jwt}`  
            }
        }).then(res=>updateUser(res)).catch(err=>console.log(err))
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
            message.success({content:"Producto eliminado",className: 'messageVerification',duration: '10'})
        }).catch(err=>console.log(err))
    }
 
    const okCart = ()=>{
        actualCart.map(e=>{delete e._id;delete e.id})
        user.pedidos.push({
            carrito:(actualCart as Carrito[]),
            Terminado:false, 
            total: totalPrice
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
                if (e.combo) {
                    return ({
                        cantidad: e.cantidad,
                        producto: (e.combo as ProductoCombo).nombre,
                        precio : e.precio,
                        peso: e.peso
                    })
                }else{
                    return ({
                        cantidad: e.cantidad,
                        producto: (e.producto as Producto).nombre,
                        precio : e.precio,
                        peso: e.peso
                    })
                }

            })
            axios.post(`${url}/pedidos`,{
                Carrito: carrito,
                user: user._id ,
                Entregado: false,
                direccion: direccion,
                telefono_cliente: user.telefono ? user.telefono : '',
                observaciones: Observaciones,
                total: totalPrice,
                nombre_cliente: user.nombre?user.nombre:user.username,
                correo_cliente: user.email
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
                    <div className='titleCarrito'>
                        <h1>Tu Carrito</h1>
                        {totalPrice>30000?
                            <span><CheckCircleTwoTone twoToneColor="#52c41a"/> Has completado el pedido mínimo</span>
                        :
                            <span><WarningTwoTone twoToneColor="#eb2f96"/> Te faltan: <span>${30000-totalPrice}</span>para completar el pedido mínimo</span>   
                        }
                    </div>
                    
                    <div className='containerProducts'>
                        {actualCart?.length>0 ? actualCart?.map((product,i)=>(
                            <div key={product._id} className='productItem'>
                                <div className='productImg'>
                                    {product.combo?
                                        <img src={`${url}${(product.combo as ProductoCombo).imagenes.url}`} alt={`Mercatto ${(product.combo as ProductoCombo).nombre} `}/>
                                        :
                                        <img src={`${url}${(product.producto as Producto).imagenes.url}`} alt={`Mercatto ${(product.producto as Producto).nombre} `}/>
                                    }
                                </div>
                                <div className='productInfo'>
                                    {product.combo?
                                    <>
                                        <div>
                                            <span className='price'>${formatNumber((product.combo as ProductoCombo).precioDescuento)}</span>
                                        </div>
                                        <h2>{(product.combo as ProductoCombo).nombre}</h2>
                                        <span className='productDesc'>{(product.combo as ProductoCombo).descripcion}</span>
                                    </>
                                    :
                                    <>
                                        <div>
                                            <span className='price'>${formatNumber((product.producto as Producto).precioDescuento) }</span>
                                            {(product.producto as Producto).descuento>0? <span className='priceDescount'>${(product.producto as Producto).precio}</span> :null}
                                        </div>
                                        <h2>{(product.producto as Producto).nombre}</h2>
                                        <span className='productDesc'>{(product.producto as Producto).descripcion}</span>
                                    </>
                                    }
                                </div>
                                <div className='productAction'>
                                    <span>{product.cantidad}</span>
                                    <button onClick={()=>minus(i)}>
                                        <span>-</span>
                                    </button>
                                    <button onClick={()=>plus(i)}>
                                        <span>+</span>
                                    </button>
                                    <CloseOutlined onClick={()=>{settoDelete(i);setmodalVisible(true)}}  />
                                </div>
                            </div>
                        )):
                        <div className='emptyCart'>
                            <h1>Tu carrito está vació</h1>
                            <Link href={'/'}>
                                <a>
                                    <button>
                                        Te invitamos a regresar a la tienda para seguir comprando.
                                    </button>
                                    
                                </a>
                            </Link>
                        </div>
                        }

                    </div>
                </div>
                <div className="carritoRight">
                    {actualCart?.length>0?
                        <div className='confirmCart'>
                            <div className='info'>
                                <Input value={direccion} placeholder='Dirección' onChange={(e)=>setDireccion(e.target.value)}></Input>
                                <Checkbox checked={saveLocation} onChange={()=>setSaveLocation(!saveLocation)}>Guardar Dirección para futuras compras</Checkbox>
                                <TextArea style={{resize: 'none'}} placeholder='Observaciones' onChange={(e)=>setObservaciones(e.target.value)}></TextArea>
                            </div>
                            <div className='buttons'>
                                <span>Total: ${formatNumber(totalPrice)}</span>
                                <br/>
                                <div>
                                    <button onClick={()=>vaciarCarrito()} type="button" className="btn btn-primary btn-lg">
                                        Vaciar Carrito
                                    </button>
                                    <button disabled={totalPrice>=30000?false:true} onClick={okCart} type="button" className="btn btn-primary btn-lg">
                                        Realizar pedido
                                    </button>
                                </div>
                                
                            </div>
                        </div>
                    :null}
                </div>
            </div>
    </Layout>
    <Modal centered onCancel={HandleClose} visible={modalVisible}>
        {actualCart?
        <div className='containerForm'>
            {actualCart[toDelete]?.combo?
                <h2>{`¿Deseas eliminar el combo: ${(actualCart[toDelete]?.combo as ProductoCombo)?.nombre}?`}</h2>
            :
                <h2>{`¿Deseas eliminar el producto ${(actualCart[toDelete]?.producto as Producto)?.nombre}?`}</h2>
            }
            <div className="image">
                {actualCart[toDelete]?.combo?
                    <img src={`${url}${(actualCart[toDelete]?.combo as ProductoCombo)?.imagenes.url}`} alt={`${(actualCart[toDelete]?.combo as ProductoCombo)?.nombre} mercatto`} />   
                :
                    <img src={`${url}${(actualCart[toDelete]?.producto as Producto)?.imagenes.url}`} alt={`${(actualCart[toDelete]?.producto as Producto)?.nombre} mercatto`} />   
                }
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