import React,{useEffect,useState} from 'react'
//components
import Layout from '../components/Layout';
//context
import useAuth from '../providers/AuthProvider'
//types
import {Pedidos} from '../utils/types'
import {formatNumber} from '../utils/functions'

const carrito = (props:{url:string}):JSX.Element=>{
    const { url } = props
    const [pedidos, setpedidos] = useState<Pedidos[]>()

    //context
    const {user} = useAuth()

    //Effect
    useEffect(() => {
        const actual:Pedidos[] = user?.pedidos
        setpedidos(actual?actual:[])
    }, [user])

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
                                const month = date.getMonth();
                                const year  = date.getFullYear();
                                const precios = e.carrito.map(l=>l.precio)
                                const total = precios.reduce((a,b)=>a+b,0)
                            return (
                            <div className="productItem">
                                <div>{`Fecha de pedido: ${year}/${month}/${day}`}</div>
                                <div>{`Cantidad de productos: ${e.carrito.length}`}</div>
                                <div>{`Precio total $ ${formatNumber(total+4500)}`}</div>
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
    return {props: {url:URL}}
}
export default React.memo(carrito)