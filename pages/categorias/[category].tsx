import Layout from '../../components/Layout';
//Nextjs
import Link from 'next/link'
import {useRouter} from 'next/router'
//Antd
import {ArrowLeftOutlined} from '@ant-design/icons';
//utils
import {hexToRgb} from '../../utils/functions'

//Types
type Sub_Categorias = {
    categoria: string
    _id: string
    portada: {url: string}
    titulo:string
}

type Data_category ={
    _id:string
    portada: {url: string}
    Categoria: string
}

const CategoryComponent = (props:{dataSubCategoria:Sub_Categorias[], background:string, contrast:boolean, url:string, dataCategory:Data_category[]}) =>{

    const {dataSubCategoria ,background, contrast, url, dataCategory} = props

    //router
    const router = useRouter()
    
    const category = dataCategory[0]

    return(
        <div>
            <Layout urlBack={url} logoWhite={!contrast} pathPublic={'../'} title={category.Categoria} color={!contrast ? "#ffffff" :"#8D8D8D"}  background={`#${background}`}>
                <div className='categoryMain'>
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
                                    <Link href={{pathname:`sub_categoria/${subcategories.titulo.toLowerCase()}`,query:{id:subcategories._id, contrast: contrast, background: background}}}>
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
                </div>
            </Layout>
        </div>
    )
}

export async function getServerSideProps (ctx) {
    const URL = process.env.URL_STRAPI;
    const subCategoria = await fetch(`${URL}/sub-categorias?id=${ctx.query.id}`,{method: 'GET'})
    const dataCategory = await fetch(`${URL}/categorias?id=${ctx.query.id}`,{method: 'GET'})
    const dataCategoryJson  = await dataCategory.json()
    const jsonSubCategoria = await subCategoria.json()
    const background = ctx.query.cr
    const contrast = ctx.query.cn === "true" ? true : false
    return {props: {dataSubCategoria:jsonSubCategoria,background:background, contrast: contrast, url:URL, dataCategory: dataCategoryJson}}
}

export default CategoryComponent