import React,{useEffect,useState} from 'react'
//next
import {useRouter} from 'next/router'
//components
import Layout from '../components/Layout';
//antd
import {ArrowLeftOutlined,ShoppingCartOutlined} from '@ant-design/icons';
//context
import useAuth from '../providers/AuthProvider'
//types
import {Carrito} from '../utils/types'
const carrito = (props:{url:string, /*  background: string, contrast: boolean */}):JSX.Element=>{
    const { /*  background, contrast ,*/  url   } = props
    const [actualCart, setactualCart] = useState<Carrito[]>()
    const background = "#fffff"
    const contrast = true
      //context
      const {user} = useAuth()
    //router
    const router = useRouter()

    useEffect(() => {
        const actual = user?.pedidos?.find(e=>e.Terminado?false:true)?.carrito
        setactualCart(actual?actual:[])
    }, [user])
    return (
    <Layout urlBack={url}  logoWhite={false} pathPublic={'../../'} title={"Carrito"} color={!contrast ? "#ffffff" :"#8D8D8D"}  background={`#${background}`}>
            <div className='carritoMain'>
                <div className='carritoLeft'>
                     <ShoppingCartOutlined />

                    <a onClick={()=>router.back()} style={{color: `${!contrast ? "#ffffff" :"#8D8D8D"}`}} className='backArrow'>
                            <ArrowLeftOutlined />
                    </a>
                </div>
                <div>

                <div className='carritoRight row'>
                        <div className="col-lg-12 targetSubCategory">
                            {actualCart?.map(e=>{
                                return (
                                    <div  className="col-sm" >
                                        <h2 style={{color: !contrast ? "#ffffff" : "#787878"}}>{e.producto.nombre}</h2>
                                        <img src={`${url}${e.producto.imagenes.url}`} alt={`${e.producto.nombre} mercatto`}/>
                                    </div>
                                )
                            })}
                        </div>
                    </div>                  
                </div>
            </div>
    </Layout>
    )
}
export async function getServerSideProps (ctx) {
    const URL = process.env.URL_STRAPI;
    // const dataSubCategory = await fetch(`${URL}/sub-categorias?only=${ctx.query.id}`,{method: 'GET'})
    // const jsonSubcategory = await dataSubCategory.json()
    // const dataProducts = await fetch(`${URL}/productos?id_sub_category=${ctx.query.id}`,{method: 'GET'})
    // const jsonProducts = await dataProducts.json()
    // const contrast = ctx.query.contrast === "true" ? true : false
    return {props: {url:URL,/*  contrast: contrast, background: ctx.query.background} */}}
}
export default React.memo(carrito)