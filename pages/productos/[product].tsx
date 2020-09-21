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
import { Carrito } from '../../utils/types';
//Types
type Products = {
    descripcion: string
    _id: string
    imagenes: {url: string}
    nombre:string
    precio: number
    peso : string
}


const ProductSearchComponent = (props:{url:string, dataProducts: Products[], titleInit: string}) =>{
    //context
    const {user ,setModalAuthSignIn,updateUser } = useAuth()

    const {url,  dataProducts, titleInit } = props
    //state
    const [left, setleft] = useState<Boolean>()
    const [title, settitle] = useState<string>()
    const [quantity, setquantity] = useState(1)
    const [selectedProduct, setselectedProduct] = useState<Products>()
    //router
    const router = useRouter()

    useEffect(() => {
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
    const handleClickProduct= (product:Products)=>{
        setquantity(1)
        setselectedProduct(product)
        setleft(false)
        settitle(product.nombre)
    }
    // const category = dataCategory[0]
    const addCart = () =>{
        if(user.jwt && quantity>0){
            var carrito: Carrito[] = user.carrito
            var isProdcut = user.carrito.findIndex(e=>e.producto.id === selectedProduct._id)
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
                                        {`$${selectedProduct?.precio}`}
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

                    <a onClick={()=>router.back()} style={{color: `${"#8D8D8D"}`}} className='backArrow'>
                            <ArrowLeftOutlined />
                    </a>
                </div>
                <div className='productRight row'>

                    {dataProducts.length >0 ? dataProducts.map(product=>(
                        <div className='col-lg-4 targetSubProduct' key={product._id}>
                            <div className='productTarget'>
                                <div  onClick={e=>handleClickProduct(product)}>
                                    <h2 style={{color: "#787878"}}>{product.nombre}</h2>
                                    <span className='productDescription' style={{color: "#787878"}}>{product.descripcion}</span>
                                    <img src={`${url}${product.imagenes.url}`} alt={`${product.nombre} mercatto`}/>
                                    <span className='productPrice'  style={{color: "#787878"}}>{`$${product.precio}`}</span>
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