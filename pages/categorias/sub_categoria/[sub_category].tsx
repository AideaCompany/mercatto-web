import Layout from '../../../components/Layout';
//Nextjs
import Link from 'next/link'
import {useRouter} from 'next/router'
//Antd
import {ArrowLeftOutlined} from '@ant-design/icons';
//utils
import {hexToRgb} from '../../../utils/functions'

//Types
type Products = {
    descripcion: string
    _id: string
    imagenes: {url: string}
    nombre:string
    precio: number
}

type SubCategory = {
    _id:string
    portada: {url: string}
    titulo: string
}

const SubCategoryComponent = (props:{url:string, dataProducts: Products[], dataSubCategory: SubCategory, background: string, contrast: boolean}) =>{

    const { dataSubCategory ,background, contrast,  url,  dataProducts } = props

    //router
    const router = useRouter()
    
    // const category = dataCategory[0]

    return(
        <Layout urlBack={url}  logoWhite={!contrast} pathPublic={'../../'} title={dataSubCategory.titulo} color={!contrast ? "#ffffff" :"#8D8D8D"}  background={`#${background}`}>
            {/* <div className='categoryMain'>
                <div className='categoryLeft'>
                    <img src={`${url}${category.portada.url}`} alt={`mercatto ${category.Categoria}`}/>
                    <a onClick={()=>router.push('/')} style={{color: `${!contrast ? "#ffffff" :"#8D8D8D"}`}} className='backArrow'>
                            <ArrowLeftOutlined />
                    </a>
                </div>
                <div className='categoryRight row'>
                    {dataSubCategoria.map(subcategories=>(
                        <div className='col-lg-4 targetSubCategory' key={subcategories._id}>
                            <div style={{background: hexToRgb(`#${background}`)}}>
                                <Link href='/'>
                                    <a>
                                        <div>
                                            <h2 style={{color: !contrast ? "#ffffff" : "#787878"}}>{subcategories.titulo}</h2>
                                            <img src={`${url}${subcategories.portada.url}`} alt={`${subcategories.titulo} mercatto`}/>
                                        </div>
                                    </a>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
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