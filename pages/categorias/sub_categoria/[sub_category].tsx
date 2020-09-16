import {useEffect,useState} from 'react'
import Layout from '../../../components/Layout';
//Nextjs
import Link from 'next/link'
import {useRouter} from 'next/router'
//Antd
import {ArrowLeftOutlined,PlusOutlined,MinusOutlined} from '@ant-design/icons';
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
    const [left, setleft] = useState<JSX.Element>()
    const [title, settitle] = useState<string>()
    const [queantity, setqueantity] = useState(0)
    //router
    const router = useRouter()

    useEffect(() => {
        setleft(
            <>
                <img src={`${url}${dataSubCategory.portada.url}`} alt={`mercatto ${dataSubCategory.titulo}`}/>

            </>
        )
        settitle(dataSubCategory.titulo)
    }, [])

    const handleClickProduct= (product:Products)=>{
        console.log(background);
        setleft(
            <>  
                <div className="productElements">
                    <img src={`${url}${product.imagenes.url}`} alt={`mercatto ${product.nombre}`}/>
                    <div  className="productPrice" style={{color:!contrast ? "#ffffff" :"#8D8D8D"}}>
                        <div>
                            {`$${product.precio} cop`}
                        </div>
                        <div className="simbols" > 
                            <div className="circle"  style={{color:`#${background}`,background:!contrast ? "#ffffff" :"#8D8D8D"}}>
                                <PlusOutlined  />
                            </div>
                                {queantity}
                            <div className="circle" style={{color:`#${background}`,background:!contrast ? "#ffffff" :"#8D8D8D"}}>
                                <MinusOutlined   />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
        settitle(product.nombre)
    }
    // const category = dataCategory[0]
    
    return(
        <Layout urlBack={url}  logoWhite={!contrast} pathPublic={'../../'} title={title} color={!contrast ? "#ffffff" :"#8D8D8D"}  background={`#${background}`}>
            <div className='productMain'>
                <div className='productLeft'>
                   {left}
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