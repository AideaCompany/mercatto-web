import React,{useEffect,useState} from 'react'
//next
import {useRouter} from 'next/router'
//components
import Layout from '../components/Layout';
//antd
import {ArrowLeftOutlined,ShoppingOutlined} from '@ant-design/icons';
//context
import useAuth from '../providers/AuthProvider'
//types
import {Carrito, Pedidos} from '../utils/types'
import { Modal ,Form, Button, message} from 'antd';
//axios
import axios from 'axios'
type showCarrito = Carrito & {totalPrecio?:number}

const carrito = (props:{url:string}):JSX.Element=>{
    const { url } = props
    const [pedidos, setpedidos] = useState<Pedidos[]>()
    const background = "#e5f5ff"
      //context
      const {user,updateUser} = useAuth()
    //router
    const router = useRouter()
    useEffect(() => {
        const actual:Pedidos[] = user?.pedidos
        setpedidos(actual?actual:[])
    }, [user])

    return (
        <>
    <Layout urlBack={url}  logoWhite={false} pathPublic={'../../'} title={"Mis pedidos"} color={"#8D8D8D"}  background={"#EEEEEE"}>
            <div className='pedidosMain'>
                <div className='pedidosLeft'>
                <ShoppingOutlined />

                    <a onClick={()=>router.back()} style={{color: "#8D8D8D"}}
                        className='backArrow'>
                        <ArrowLeftOutlined />
                    </a>
                </div>
                <div className="pedidosRight">
                    <h2 style={{paddingLeft:"5%"}}>Lista de pedidos:</h2>
                    <div className='pedidos'>
                        <div className="targetSubCategory">
                            {pedidos?.map((e,i)=>{
                            return (
                            <div className="productItem" style={{background:background}}>
                                <div className="titulo">
                                    <h2 style={{color:"#787878"}}>{e.createdAt}</h2>

                                </div>
                                <div className="price">{`$${e.carrito.length}`}</div>
 

                            </div>
                            )
                            })}
                        </div>
                    </div>

                </div>
            </div>
    </Layout>
    </>
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