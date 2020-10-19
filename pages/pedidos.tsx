import React,{useEffect,useState} from 'react'
//components
import Layout from '../components/Layout';
//context
import useAuth from '../providers/AuthProvider'
//types
import {Carrito, Pedidos, Producto, ProductoCombo} from '../utils/types'
import {formatNumber} from '../utils/functions'
//Antd
import {Modal} from 'antd'

const carrito = (props:{url:string}):JSX.Element=>{
    const { url } = props
    
    //State
    const [pedidos, setpedidos] = useState<Pedidos[]>()
    const [openModal, setOpenModal] = useState<boolean>(false)
    const [idPedido, setIdPedido] = useState<string>('')
    const [carrito, setCarrito] = useState<Carrito[]>([])
    //context
    const {user} = useAuth()

    //Effect
    useEffect(() => {
        const actual:Pedidos[] = user?.pedidos
        setpedidos(actual?actual:[])
    }, [user])
    
    useEffect(() => {
        if (idPedido !== '') {
            const index =  pedidos.findIndex(e=>e._id ===  idPedido)
            const carritoPedido = pedidos[index].carrito
            setCarrito(carritoPedido)
            setOpenModal(true)
        }
    }, [idPedido])

    //getCountPr

    const getCountProduct = (carrito: Carrito[]) => {
        var suma = 0
        carrito.forEach(element => {
            suma += element.cantidad
        });
        return suma
    }

    const handleClose = () =>{
        setOpenModal(false)
        setIdPedido('')
        Modal.destroyAll()
    }
    return (
    <>
        <Layout urlBack={url}  logoWhite={false} pathPublic={'../../'} title={"Mis pedidos"} color={"#8D8D8D"}  background={"#EEEEEE"}>
                <div className='pedidosMain'>
                    <div className="pedidosRight">
                        <h2 style={{paddingLeft:"5%"}}>Lista de pedidos:</h2>
                        <div className='pedidos'>
                            <div className="targetSubCategory">
                                {pedidos?.map((e,i)=>{
                                    const date = new Date(e.createdAt);
                                    const day = date.getDay();
                                    // console.log(date, day)
                                    const month = date.getMonth()+1 < 10 ? `0${date.getMonth()+1}` : date.getMonth()+1
                                    const year  = date.getFullYear();
                                    const precios = e.carrito.map(l=>l.precio)
                                    const total = precios.reduce((a,b)=>a+b,0)
                                return (
                                <div onClick={()=>setIdPedido(e._id)} key={e._id} className="productItem">
                                    <div>{`Fecha de pedido: ${day}/${month}/${year}`}</div>
                                    <div>{`Cantidad de productos: ${getCountProduct(e.carrito)}`}</div>
                                    <div>{`Precio total $ ${formatNumber(total+4500)}`}</div>
                                </div>
                                )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
        </Layout>
        <Modal width={500} visible={openModal} closable={false} centered onCancel={handleClose}>
            <div className='pedidoCarrito'>
                <div>
                    {carrito.map(producto=>{
                        return(
                            <div key={producto._id} className='productTarget'>
                                {producto.producto ? 
                                <>
                                    <div className='nameProduct'>
                                        <span className='name'>{(producto.producto as Producto).nombre}</span>
                                        <span className='description'>{(producto.producto as Producto).descripcion}</span>
                                    </div>
                                    <div className='cantidadProduct'>
                                        <span>Cantidad: {producto.cantidad}</span>
                                    </div>
                                    <div className='precioProduct'>
                                        <span>Precio: ${formatNumber(producto.precio)}</span>
                                    </div>
                                </>
                                :
                                <>
                                    <div className='nameProduct'>
                                        <span className='name'>{(producto.combo as ProductoCombo).nombre}</span>
                                    </div>
                                    <div className='cantidadProduct'>
                                        <span>Cantidad: {producto.cantidad}</span>
                                    </div>
                                    <div className='precioProduct'>
                                        <span>Precio: ${formatNumber(producto.precio)}</span>
                                    </div>
                                </>

                                }
                                
                            </div>
                        )
                    })}
                    
                </div>
            </div>
        </Modal>
    </>
    )
}
export async function getServerSideProps (ctx) {
    const URL = process.env.URL_STRAPI;
    return {props: {url:URL}}
}
export default React.memo(carrito)