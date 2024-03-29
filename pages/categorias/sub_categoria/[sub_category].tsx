import {useEffect,useState} from 'react'
import Layout from '../../../components/Layout';
//Nextjs
import {useRouter} from 'next/router'
//Antd
import {ArrowLeftOutlined} from '@ant-design/icons';
//utils
import {hexToRgb, getNewPrice} from '../../../utils/functions'
//axios
import axios from 'axios'
//context
import useAuth from '../../../providers/AuthProvider'
import { message } from 'antd';
import { Carrito,Producto } from '../../../utils/types';
//Types

type SubCategory = {
    _id:string
    portada: {url: string}
    titulo: string
}

const SubCategoryComponent = (props:{url:string, dataProducts: Producto[], dataSubCategory: SubCategory, background: string, contrast: boolean}) =>{
    //context
    const {user,setModalAuthSignIn,updateUser} = useAuth()

    const { dataSubCategory ,background, contrast,  url,  dataProducts } = props
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
        settitle(`${dataSubCategory.titulo}`)
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
    // const category = dataCategory[0]
    const addCart = ()=>{
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
        <Layout urlBack={url}  logoWhite={!contrast} pathPublic={'../../'} title={title} color={!contrast ? "#ffffff" :"#8D8D8D"}  background={`#${background}`}>
            <div className='productMain'>
                <div className='productLeft'>
                    {left?<img src={`${url}${dataSubCategory.portada.url}`} alt={`mercatto ${dataSubCategory.titulo}`}/>:
                        <div className="productElements">
                            <img src={`${url}${selectedProduct?.imagenes.url}`} alt={`mercatto ${selectedProduct?.nombre}`}/>
                            <div  className="productPrice" style={{color:!contrast ? "#ffffff" :"#8D8D8D"}}>
                                <div>
                                    <span className='mainPrice'>
                                        {selectedProduct?.descuento>0 ?<> <span className='discounPrice'>${selectedProduct?.precio}</span><span className='percentRight'>-{selectedProduct?.descuento}%</span></> : null}
                                        {`$${selectedProduct?.precioDescuento}`}
                                    </span>
                                </div>
                                <div className="simbols" > 
                                    <div  onClick={minus} className="circle" style={{color:`#${background}`,background:!contrast ? "#ffffff" :"#8D8D8D"}}>
                                        -
                                    </div>
                                    <div className="number">
                                        {quantity}
                                    </div>
                                    <div onClick={plus} className="circle"  style={{color:`#${background}`,background:!contrast ? "#ffffff" :"#8D8D8D"}}>
                                        +
                                    </div>
                                    
                                </div>
                            </div>
                            <div className="addCart" onClick={addCart}>
                                    <button>Agregar al carrito</button>
                            </div>
                        </div>
                        }

                    <span onClick={()=>router.back()} style={{color: `${!contrast ? "#ffffff" :"#8D8D8D"}`}} className='backArrow'>
                            <ArrowLeftOutlined />
                    </span>
                </div>
                <div className='productRight row'>
                    {dataProducts.map(product=>(
                        <div className='col-lg-4 targetSubProduct' key={product._id}>
                            <div style={{background: hexToRgb(`#${background}`)}}>
                                <div  onClick={e=>handleClickProduct(product)}>
                                    <h2 style={{color: !contrast ? "#ffffff" : "#787878"}}>{product.nombre} - {product.peso}</h2>
                                    <span className='productDescription' style={{color: !contrast ? "#ffffff" : "#787878"}}>{product.descripcion}</span>
                                    <img src={`${url}${product.imagenes.url}`} alt={`${product.nombre} mercatto`}/>
                                    {product.descuento>0?<span style={{color: !contrast ? "#ffffff" : "#787878"}} className='productInit'>${product.precio}</span>:null}
                                    <span className='productPrice'  style={{color: !contrast ? "#ffffff" : "#787878"}}>{`$${product.precioDescuento}`}{product.descuento>0 ? <span style={{fontSize:'1vw' , margin : " 0 0 1vw 0.5vw"}}>{product.descuento}% OFF</span>: null}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    )
}

export async function getServerSideProps (ctx) {
    const URL = process.env.URL_STRAPI;
    const dataSubCategory = await fetch(`${URL}/sub-categorias?only=${ctx.query.id}`,{method: 'GET'})
    const jsonSubcategory = await dataSubCategory.json()
    const dataProducts = await fetch(`${URL}/productos?id_sub_category=${ctx.query.id}`,{method: 'GET'})
    const jsonProducts = await dataProducts.json()
    const contrast = ctx.query.contrast === "true" ? true : false
    return {props: {url:URL, contrast: contrast, background: ctx.query.background, dataSubCategory: jsonSubcategory, dataProducts: jsonProducts}}
}

export default SubCategoryComponent