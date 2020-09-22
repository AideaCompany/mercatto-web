import {useEffect,useState} from 'react'
import Layout from '../../components/Layout';
//Nextjs
import Link from 'next/link'
import {useRouter} from 'next/router'
//Antd
import {ArrowLeftOutlined, FrownOutlined} from '@ant-design/icons';
//axios
import axios from 'axios'
//context
import useAuth from '../../providers/AuthProvider'
import { message } from 'antd';
import { Carrito ,Producto} from '../../utils/types';
//utils
import {getNewPrice} from '../../utils/functions'

const ProductSearchComponent = (props:{url:string, dataProducts: Producto[], titleInit: string}) =>{
    //context
    const {user ,setModalAuthSignIn,updateUser } = useAuth()

    const {url,  dataProducts, titleInit } = props
    //state
    const [left, setleft] = useState<Boolean>()
    const [title, settitle] = useState<string>()
    const [quantity, setquantity] = useState(1)
    const [selectedProduct, setselectedProduct] = useState<Producto>()
    //router
    const router = useRouter()


    useEffect(() => {
        dataProducts.map(e=>e.precioDescuento=getNewPrice(e.descuento,e.precio))
        setleft(true)
        settitle(`Resultados de busqueda para ${titleInit}`)
    }, [])
    
    const plus = ()=>{
        const actual  = quantity+1
        setquantity(actual)
    }   
    const minus = ()=>{
        if(quantity>0){
            const actual  = quantity-1
            setquantity(actual)
        }
    }
    const handleClickProduct= (product:Producto)=>{
        setquantity(1)
        setselectedProduct(product)
        setleft(false)
        settitle(`${product.nombre} - ${product.peso}`)
    }

    const addCart = () =>{
        if(user.jwt && quantity>0){
            var carrito: Carrito[] = user.carrito
            var isProdcut = user.carrito.findIndex(e=>(e.producto as Producto)._id === selectedProduct._id)
            if (isProdcut >-1) {
                carrito[isProdcut].cantidad += quantity
            }else{
                carrito.push({cantidad:quantity,producto:selectedProduct._id})
            }
            axios.put(`${url}/users/${user._id}`,{
                carrito:carrito}, {
                headers: {
                    Authorization: `Bearer ${user.jwt}`
                }
            }).then(res=>{
                updateUser(res);
                message.success({content:"Producto agregado",className: 'messageVerification',duration: '5'})
            }).catch(err=>console.log(err))
        }else if(quantity===0){
            message.info({content:"Porfavor indica la cantidad",className: 'messageVerification',duration: '5'})
        }else{
            message.info({content:"Porfavor inicia sesión para usar el carrito",className: 'messageVerification',duration: '5'})
            setModalAuthSignIn(true)
        }

    }
    return(
        <Layout urlBack={url}  logoWhite={false} pathPublic={'../'} title={title} color={"#8D8D8D"}  background={`#EEEEEE`}>
            <div className='productMain'>
                <div className='productLeft'>
                    {left? <div></div>:
                        <div className="productElements">
                            <img src={`${url}${selectedProduct?.imagenes.url}`} alt={`mercatto ${selectedProduct?.nombre}`}/>
                            <div  className="productPrice" style={{color:"#8D8D8D"}}>
                                <div>
                                    <span className='mainPrice'>
                                        {selectedProduct?.descuento>0 ?<> <span className='discounPrice'>${selectedProduct?.precio}</span><span style={{color:'#01A22F'}} className='percentRight'>-{selectedProduct?.descuento}%</span></> : null}
                                        {`$${selectedProduct?.precioDescuento}`}
                                    </span>
                                </div>
                                <div className="simbols" > 
                                    <div  onClick={minus} className="circle" style={{color:`#ffffff`,background:"#8D8D8D"}}>
                                        -
                                    </div>
                                    <div className="number">
                                        {quantity}
                                    </div>
                                    <div onClick={plus} className="circle"  style={{color:`#ffffff`,background:"#8D8D8D"}}>
                                        +
                                    </div>
                                    
                                </div>
                            </div>
                            <div className="addCart" onClick={addCart}>
                                    <button>Agregar al carrito</button>
                            </div>
                        </div>
                        }

                    <span onClick={()=>router.back()} style={{color: `${"#8D8D8D"}`, cursor:"pointer"}} className='backArrow'>
                            <ArrowLeftOutlined />
                    </span>
                </div>
                <div className='productRight row'>

                    {dataProducts.length >0 ? dataProducts.map(product=>(
                        <div className='col-lg-4 targetSubProduct' key={product._id}>
                            <div className='productTarget'>
                                <div  onClick={e=>handleClickProduct(product)}>
                                    <h2 style={{color: "#787878"}}>{product.nombre} - {product.peso}</h2>
                                    <span className='productDescription' style={{color: "#787878"}}>{product.descripcion}</span>
                                    <img src={`${url}${product.imagenes.url}`} alt={`${product.nombre} mercatto`}/>
                                    {product.descuento>0?<span style={{color: "#787878"}} className='productInit'>${product.precio}</span>:null}
                                    <span className='productPrice'  style={{color: "#787878"}}>{`$${product.precio}`} {product.descuento>0 ? <span style={{fontSize:'1vw' , margin : " 0 0 1vw 0.5vw", color:'#01A22F'}}>{product.descuento}% OFF</span>: null}</span>
                                </div>
                            </div>
                        </div>
                    )):
                    <div className='empty'>
                        <h2>No existen Productos relacionados con tu busqueda</h2>
                        <FrownOutlined />
                        <br/>
                        <Link href={'/'}>
                            <a>
                                Regresar
                            </a>
                        </Link>
                    </div>}
                </div>
            </div>
        </Layout>
    )
}

export async function getServerSideProps (ctx) {
    const URL = process.env.URL_STRAPI;
    const dataProducts = await fetch(`${URL}/productos?search_product=${ctx.query.product}`,{method: 'GET'})
    const jsonProducts = await dataProducts.json()
    return {props: {url:URL, dataProducts: jsonProducts, titleInit: ctx.query.product}}
}

export default ProductSearchComponent