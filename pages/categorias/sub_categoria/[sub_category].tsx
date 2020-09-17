import {useEffect,useState} from 'react'
import Layout from '../../../components/Layout';
//Nextjs
import Link from 'next/link'
import {useRouter} from 'next/router'
//Antd
import {ArrowLeftOutlined,ShoppingCartOutlined} from '@ant-design/icons';
//utils
import {hexToRgb} from '../../../utils/functions'

//Types
type Products = {
    descripcion: string
    _id: string
    imagenes: {url: string}
    nombre:string
    precio: number
    peso : string
}

type SubCategory = {
    _id:string
    portada: {url: string}
    titulo: string
}

const SubCategoryComponent = (props:{url:string, dataProducts: Products[], dataSubCategory: SubCategory, background: string, contrast: boolean}) =>{

    const { dataSubCategory ,background, contrast,  url,  dataProducts } = props
    //state
    const [left, setleft] = useState<Boolean>()
    const [title, settitle] = useState<string>()
    const [quantity, setquantity] = useState(0)
    const [selectedProduct, setselectedProduct] = useState<Products>()
    //router
    const router = useRouter()

    useEffect(() => {
        setleft(true)
        settitle(dataSubCategory.titulo)
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
        setselectedProduct(product)
        setleft(false)
        settitle(product.nombre)
    }
    // const category = dataCategory[0]
    const addCart = ()=>{
        console.log(selectedProduct);
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
                                    {`$${selectedProduct?.precio} cop`}
                                </div>
                                <div className="simbols" > 
                                    <div onClick={plus} className="circle"  style={{color:`#${background}`,background:!contrast ? "#ffffff" :"#8D8D8D"}}>
                                        +
                                    </div>
                                        <div className="number">
                                            {quantity}
                                        </div>
                                    <div  onClick={minus} className="circle" style={{color:`#${background}`,background:!contrast ? "#ffffff" :"#8D8D8D"}}>
                                        -
                                    </div>
                                </div>
                            </div>
                            <div className="addCart" onClick={addCart}>
                                    <button>Agregar al carrito</button>
                            </div>
                        </div>
                        }

                    <a onClick={()=>router.back()} style={{color: `${!contrast ? "#ffffff" :"#8D8D8D"}`}} className='backArrow'>
                            <ArrowLeftOutlined />
                    </a>
                </div>
                <div className='productRight row'>
                    {dataProducts.map(product=>(
                        <div className='col-lg-4 targetSubProduct' key={product._id}>
                            <div style={{background: hexToRgb(`#${background}`)}}>
                                        <div  onClick={e=>handleClickProduct(product)}>
                                            <h2 style={{color: !contrast ? "#ffffff" : "#787878"}}>{product.nombre}</h2>
                                            <img src={`${url}${product.imagenes.url}`} alt={`${product.nombre} mercatto`}/>
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