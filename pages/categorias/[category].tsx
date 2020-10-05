import {useEffect, useState} from 'react'
import Layout from '../../components/Layout';
//axios
import Axios from 'axios';
//antD
import { Skeleton, message } from 'antd';
//utils
import {getNewPrice} from '../../utils/functions'
//Auth
import useAuth from '../../providers/AuthProvider'
//Types
import  { Producto, Carrito } from '../../utils/types'
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

type Count = {
    count: number
    _id: string
}

const CategoryComponent = (props:{dataSubCategoria:Sub_Categorias[], url:string, dataCategory:Data_category[]}) =>{

    const {dataSubCategoria , url, dataCategory} = props
    
    const category = dataCategory[0]

    //Providers
    const {user ,setModalAuthSignIn,updateUser } = useAuth()
    //State
    const [dataProductsToShow, setDataProductsToShow] = useState<Producto[]>([])
    const [dataProducts, setDataProducts] = useState<Producto[]>([])
    const [mainUrl, setMainUrl] = useState<string>('')
    const [textCategory, setTextCategory] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [productCart, setProductCart] = useState<Count[]>([])
    const [firstCall, setFirstCall] = useState<boolean>(false)

    //effect
    useEffect(() => {
        if (!firstCall) {
            setTextCategory(category.Categoria)
            setMainUrl(`${url}${category.portada.url}`)
            if (user.jwt) {
                Axios.get(`${url}/productos?category=${category._id}`)
                .then(res=>{
                    var productTemp: Count[] = []
                    res.data.map((e:Producto)=>e.precioDescuento=getNewPrice(e.descuento,e.precio))
                    for (let k = 0; k < res.data.length; k++) {
                        var isInCart = user.carrito?.findIndex(e=>(e.producto as Producto)._id === res.data[k]._id)
                        productTemp.push({
                            count: isInCart>-1 ? user.carrito[isInCart].cantidad : 0,
                            _id: res.data[k]._id
                        })
                    }
                    setProductCart(productTemp)
                    setFirstCall(true)
                    setDataProducts(res.data);
                    setDataProductsToShow(res.data); 
                    setLoading(false)
                })
                .catch(err=>console.log(err))
            }
        }
    }, [user])

    //functions
    const filterDataProducts = (_id:string) =>{
        if (_id === 'all') {
            setDataProductsToShow(dataProducts)
            setTextCategory(category.Categoria)
        }else{
            var newProducts:Producto[] = []
            for (let k = 0; k < dataProducts.length; k++) {
                if (_id === dataProducts[k].sub_categoria) {
                    newProducts.push(dataProducts[k])
                }
            }
            const subcategory = dataSubCategoria.findIndex(e=>e._id===_id)
            setTextCategory(`${category.Categoria}: ${dataSubCategoria[subcategory].titulo}`)
            setMainUrl(`${url}${dataSubCategoria[subcategory].portada.url}`)
            setDataProductsToShow(newProducts)
        }
    }

    //addCart
    const addCart = async (id:string) =>{
        if (user.jwt) {
            var tempCartProducts: Count[] = JSON.parse(JSON.stringify(productCart))
            var carrito: Carrito[] = user.carrito
            var isProdcut = user.carrito.findIndex(e=>(e.producto as Producto)._id === id)
            var index = tempCartProducts.findIndex(e=>e._id === id)
            tempCartProducts[index].count += 1
            if (isProdcut >-1) {
                carrito[isProdcut].cantidad = tempCartProducts[index].count
            }else{
                carrito.push({cantidad:tempCartProducts[index].count, producto: tempCartProducts[index]._id })
            }
            await updatecart(carrito)
            setProductCart(tempCartProducts)
        }
    }

    //removeCart 
    const removeCart = async (id:string) =>{
        if (user.jwt) {
            var tempCartProducts: Count[] = JSON.parse(JSON.stringify(productCart))
            var index = tempCartProducts.findIndex(e=>e._id === id)
            var carrito: Carrito[] = user.carrito
            var isProdcut = user.carrito.findIndex(e=>(e.producto as Producto)._id === id)
            if (tempCartProducts[index].count>0) {
                var count = tempCartProducts[index].count -= 1
                if (count > 0) {
                    if (isProdcut>-1) {
                        carrito[isProdcut].cantidad = count
                    }else{
                        carrito.push({cantidad:count, producto: tempCartProducts[index]._id })
                    }
                }else{
                    carrito.splice(isProdcut,1)
                }
                await updatecart(carrito)
                setProductCart(tempCartProducts)
            }
        }
    }

    //call Cart 
    const updatecart = async (carrito: Carrito[]) =>{
        Axios.put(`${url}/users/${user._id}`,{
            carrito: carrito
        },
        {
            headers: {
            Authorization: `Bearer ${user.jwt}`
            }
        }
        ).then(res=>{
            
            updateUser(res)})
        .catch(err=>{
            console.log(err)
        })
    }

    //get countCart
    const getCountCart = (id:string) =>{
        var index = productCart.findIndex(e=>e._id===id)
        return productCart[index].count
    }


    return(
        <div>
            <Layout urlBack={url} logoWhite={false}   pathPublic={'../'} title={category.Categoria}>
                <div className='categoryMain'>

                    <div className='categoryLeft'>
                        <div>
                            <h1>Categorias</h1>
                            <ul>
                                <li onClick={()=>filterDataProducts('all')}>Todos</li>
                                {dataSubCategoria.map(subcategoria=>(
                                    <li onClick={()=>filterDataProducts(subcategoria._id)} key={subcategoria._id}>{subcategoria.titulo}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className='categoryRight'>
                        <div>
                            <div className='firstTarget'>
                                <div className='imgCategory'>
                                    <img src={mainUrl} alt='categorias Mercatto'/>
                                </div>
                                <div className='textCategory'>
                                    <h1>{textCategory}</h1>
                                </div>
                            </div>
                            <div className='row rowTarget'>
                                {dataProductsToShow.map((producto)=>(
                                    <div key={producto._id} id={producto._id} className='col-lg-4 mainTargetProduct'>
                                        <div className='targetProduct'>
                                        {!loading? 
                                            <>
                                                <div className='imgProduct'>
                                                    <img src={`${url}${producto.imagenes.url}`} alt={`Mercatto ${producto.nombre} `}/>
                                                </div>
                                                <div className="targetText">
                                                    <div>
                                                        <p className='productName'>{producto.nombre}</p>
                                                    </div>
                                                    <div className='containerPrice'>
                                                        <span className='productPrice'>${producto.precioDescuento}</span> {producto.descuento>0 ? <span className='productDescuento'>${producto.precio}</span> : null}
                                                    </div>
                                                    <div>
                                                        <span className='productDescription'>{producto.descripcion}</span>
                                                    </div>
                                                    <div className='addCart'>
                                                        {user.jwt?
                                                            <>
                                                                <span>{getCountCart(producto._id)}</span>
                                                                <button onClick={()=>removeCart(producto._id)} className='buttonCount'>-</button>
                                                                <button onClick={()=>addCart(producto._id)} className='buttonCount'>+</button>
                                                            </>
                                                        :
                                                            <button onClick={()=>setModalAuthSignIn(true)} className='buttonAdd'>Agregar</button>
                                                        }
                                                        
                                                    </div>
                                                </div>
                                                {producto.descuento>0?
                                                    <div className='desc'>
                                                        <span>%{producto.descuento}</span>
                                                    </div>
                                                :null}
                                            </>
                                            :
                                            <Skeleton  loading={true} active>
                                            </Skeleton>
                                            }
                                        </div>  
                                    </div>
                                ))}
                            </div>
                        </div>
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
    return {props: {dataSubCategoria:jsonSubCategoria, url:URL, dataCategory: dataCategoryJson}}
}

export default CategoryComponent