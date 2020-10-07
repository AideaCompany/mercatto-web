import {useEffect, useState} from 'react'
import Layout from '../../components/Layout';
//axios
import Axios from 'axios';
//antD
import { Skeleton } from 'antd';
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
    const [openModalProduct, setOpenModalProduct] = useState(false)
    const [idProductModal, setIdProductModal] = useState<string>('')
    const [filterOption, setFilterOption] = useState<string>('')
    //effect
    useEffect(() => {
        if (!firstCall) {
            setTextCategory(category.Categoria)
            setMainUrl(`${url}${category.portada.url}`)
            Axios.get(`${url}/productos?category=${category._id}`)
            .then(res=>{
                var productTemp: Count[] = []
                res.data.map((e:Producto)=>e.precioDescuento=getNewPrice(e.descuento,e.precio))
                if (user.jwt) {
                    for (let k = 0; k < res.data.length; k++) {
                        var isInCar = user.carrito?.findIndex(e=>(e.producto as Producto)._id === res.data[k]._id)
                        productTemp.push({
                            count: isInCar>-1 ? user.carrito[isInCar].cantidad : 0,
                            _id: res.data[k]._id
                        })
                    }
                    setProductCart(productTemp)
                    setFirstCall(true)
                }
                setDataProducts(res.data);
                setDataProductsToShow(res.data); 
                setLoading(false)
            })
            .catch(err=>console.log(err))
        }
    }, [user])

    useEffect(() => {
        if (user.jwt) {
            var isProduct = productCart.findIndex(e=>e._id===idProductModal)
            var isProductCart = user.carrito.findIndex(e=>(e.producto as Producto)._id===idProductModal)
            var productCartTemp: Count[] = JSON.parse(JSON.stringify(productCart))
            if (isProductCart> -1) {
                productCartTemp[isProduct].count = user.carrito[isProductCart]?.cantidad
            }
            setProductCart(productCartTemp)
        }
    }, [openModalProduct])

    //functions
    const filterDataProducts = (_id:string) =>{
        if (_id === 'all') {
            setTextCategory(category.Categoria)
            if (filterOption==='highestPrice') {
                dataProducts.sort(function (a,b) {
                    var valueA = a.precioDescuento;
                    var valueB = b.precioDescuento;
                    return (valueA>valueB)? -1 : (valueA<valueB) ? 1 : 0;
                })
                setDataProductsToShow(dataProducts)
            }else if (filterOption === 'lowestPrice') {
                dataProducts.sort(function (a,b) {
                    var valueA = a.precioDescuento;
                    var valueB = b.precioDescuento;
                    return (valueA<valueB)? -1 : (valueA>valueB) ? 1 : 0;
                })
                setDataProductsToShow(dataProducts)
            }else if (filterOption === 'alpha') {
                dataProducts.sort(function(a,b) {
                    var textA = a.nombre.toUpperCase();
                    var textB = b.nombre.toUpperCase();
                    return (textA<textB)? -1: (textA>textB) ? 1 : 0 ;
                })
                setDataProductsToShow(dataProducts)
            }else{
                setDataProductsToShow(dataProducts)
            }
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
            if (filterOption==='highestPrice') {
                newProducts.sort(function (a,b) {
                    var valueA = a.precioDescuento;
                    var valueB = b.precioDescuento;
                    return (valueA>valueB)? -1 : (valueA<valueB) ? 1 : 0;
                })
                setDataProductsToShow(newProducts)
            }else if (filterOption === 'lowestPrice') {
                newProducts.sort(function (a,b) {
                    var valueA = a.precioDescuento;
                    var valueB = b.precioDescuento;
                    return (valueA<valueB)? -1 : (valueA>valueB) ? 1 : 0;
                })
                setDataProductsToShow(newProducts)
            }else if (filterOption === 'alpha') {
                newProducts.sort(function(a,b) {
                    var textA = a.nombre.toUpperCase();
                    var textB = b.nombre.toUpperCase();
                    return (textA<textB)? -1: (textA>textB) ? 1 : 0 ;
                })
                setDataProductsToShow(newProducts)
            }else{
                setDataProductsToShow(newProducts)
            }
        }
    }

    //addCart
    const addCart = async (id:string, e) =>{
        e.stopPropagation();
        if (user.jwt) {
            var tempCartProducts: Count[] = JSON.parse(JSON.stringify(productCart))
            var carrito: Carrito[] = user.carrito
            var isProdcut = user.carrito.findIndex(e=>(e.producto as Producto)._id === id)
            var index = tempCartProducts.findIndex(e=>e._id === id)
            var posProduct = dataProducts.findIndex(e=>e._id===id)
            var count = tempCartProducts[index].count += 1
            if (isProdcut >-1) {
                carrito[isProdcut].cantidad = tempCartProducts[index].count
            }else{
                carrito.push({cantidad:count, producto: tempCartProducts[index]._id, peso: dataProducts[posProduct].peso, precio: dataProducts[posProduct].precio})
            }
            await updatecart(carrito)
            setProductCart(tempCartProducts)
        }
    }

    //removeCart 
    const removeCart = async (id:string, e) =>{
        e.stopPropagation();
        if (user.jwt) {
            var tempCartProducts: Count[] = JSON.parse(JSON.stringify(productCart))
            var index = tempCartProducts.findIndex(e=>e._id === id)
            var carrito: Carrito[] = user.carrito
            var isProdcut = user.carrito.findIndex(e=>(e.producto as Producto)._id === id)
            var posProduct = dataProducts.findIndex(e=>e._id===id)
            if (tempCartProducts[index].count>0) {
                var count = tempCartProducts[index].count -= 1
                if (count > 0) {
                    if (isProdcut>-1) {
                        carrito[isProdcut].cantidad = count
                    }else{
                        carrito.push({cantidad:count, producto: tempCartProducts[index]._id, peso: dataProducts[posProduct].peso, precio: dataProducts[posProduct].precio})
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
        if (productCart.length>0) {
            var index = productCart.findIndex(e=>e._id===id)
            return productCart[index].count
        }
        
    }

    const openProduct = (id:string) => {
        setIdProductModal(id)
        setOpenModalProduct(true)
    }

    const openAuth = (e) =>{
        e.stopPropagation();
        setModalAuthSignIn(true)
    }

    const filter = (parameter:string) =>{
        var productsTemp = JSON.parse(JSON.stringify(dataProductsToShow))
        var d = Array.from(document.getElementsByClassName(parameter) as HTMLCollectionOf<HTMLElement>)
        switch (parameter) {
            case 'alpha':
                Array.from(document.getElementsByClassName('highestPrice') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('activeFilter')
                Array.from(document.getElementsByClassName('lowestPrice') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('activeFilter')
                if (filterOption===parameter) {
                    setFilterOption('')
                    setDataProductsToShow(productsTemp)
                    d[0].classList.remove('activeFilter')
                }else{
                    setFilterOption(parameter)
                    productsTemp.sort(function(a,b) {
                        var textA = a.nombre.toUpperCase();
                        var textB = b.nombre.toUpperCase();
                        return (textA<textB)? -1: (textA>textB) ? 1 : 0 ;
                    })
                    setDataProductsToShow(productsTemp)
                    d[0].classList.add('activeFilter') 
                }
                break;
            case 'highestPrice':
                Array.from(document.getElementsByClassName('alpha') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('activeFilter')
                Array.from(document.getElementsByClassName('lowestPrice') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('activeFilter')
                if (filterOption===parameter) {
                    setFilterOption('')
                    setDataProductsToShow(productsTemp)
                    d[0].classList.remove('activeFilter')
                }else{
                    setFilterOption(parameter)
                    productsTemp.sort(function (a,b) {
                        var valueA = a.precioDescuento;
                        var valueB = b.precioDescuento;
                        return (valueA>valueB)? -1 : (valueA<valueB) ? 1 : 0;
                    })
                    setDataProductsToShow(productsTemp)
                    d[0].classList.add('activeFilter') 
                }
                break;
            case 'lowestPrice':
                Array.from(document.getElementsByClassName('highestPrice') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('activeFilter')
                Array.from(document.getElementsByClassName('alpha') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('activeFilter')
                if (filterOption === parameter) {
                    setFilterOption('')
                    setDataProductsToShow(productsTemp)
                    d[0].classList.remove('activeFilter')
                }else{
                    setFilterOption(parameter)
                    productsTemp.sort(function (a,b) {
                        var valueA = a.precioDescuento;
                        var valueB = b.precioDescuento;
                        return (valueA<valueB)? -1 : (valueA>valueB) ? 1 : 0;
                    })
                    setDataProductsToShow(productsTemp)
                    d[0].classList.add('activeFilter') 
                }

                break;
            default:
                break;
        }
    }

    return(
        <div>
            <Layout idProduct={idProductModal} setOpenModalProduct={setOpenModalProduct} openModalProduct={openModalProduct} urlBack={url} logoWhite={false}   pathPublic={'../'} title={category.Categoria}>
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
                        <div style={{marginTop:'30px'}} className='filter'>
                            <h1>filtrar por:</h1>
                            <div onClick={()=>filter('highestPrice')} id='highestPrice' className='highestPrice'>
                                <span>Mayor Precio</span>
                            </div>
                            <div onClick={()=>filter('lowestPrice')} id="lowestPrice" className='lowestPrice'>
                                <span>Menor precio</span>
                            </div>
                            <div onClick={()=>filter('alpha')} id="alpha" className='alpha'>
                                <span>Orden alfabético</span>
                            </div>
                        </div>
                    </div>
                    <div className='categoryRight'>
                        <div>
                            <div className='firstTarget'>
                                <div className='textCategory'>
                                    <h1>{textCategory}</h1>
                                </div>
                            </div>
                            <div className='row rowTarget'>
                                {dataProductsToShow.map((producto)=>(
                                    <div onClick={()=>openProduct(producto._id)} key={producto._id} id={producto._id} className='col-lg-4 mainTargetProduct'>
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
                                                                <button onClick={(e)=>removeCart(producto._id,e)} className='buttonCount'>
                                                                    <span>-</span>
                                                                </button>
                                                                <button onClick={(e)=>addCart(producto._id, e)} className='buttonCount'>
                                                                    <span>+</span>
                                                                </button>
                                                            </>
                                                        :
                                                            <button onClick={openAuth} className='buttonAdd'>Agregar</button>
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