import {useEffect,useState} from 'react'
import Layout from '../../components/Layout';
//Nextjs
import Link from 'next/link'
//Antd
import { FrownOutlined} from '@ant-design/icons';
//axios
import axios from 'axios'
//context
import useAuth from '../../providers/AuthProvider'
import { Carrito ,Producto, ProductoCombo} from '../../utils/types';
//utils
import {getNewPrice, formatNumber} from '../../utils/functions'

type Count = {
    count: number
    _id: string
}

const ProductSearchComponent = (props:{url:string, dataProducts: Producto[], titleInit: string, ofer?:boolean, brand?:string}) =>{
    //context
    const {user ,setModalAuthSignIn,updateUser } = useAuth()

    const {url,  dataProducts, titleInit, ofer , brand} = props
    //state
    const [title, settitle] = useState<string>()
    const [dataProductsToShow, setDataProductsToShow] = useState<Producto[]>([])
    const [dataProductsInit, setDataProductsInit] = useState<Producto[]>([])
    const [productCart, setProductCart] = useState<Count[]>([])
    const [openModalProduct, setOpenModalProduct] = useState(false)
    const [idProductModal, setIdProductModal] = useState<string>('')
    const [filterOption, setFilterOption] = useState<string>('')
    
    

    //effect
    useEffect(() => {
        var productTemp: Count[] = []
        var dataProductsTemp:Producto[] = JSON.parse(JSON.stringify(dataProducts))
        if (titleInit !== 'combos') {
            dataProductsTemp.map(e=>e.precioDescuento=getNewPrice(e.descuento, e.precio))
            if (user.jwt) {
                for (let k = 0; k < dataProductsTemp.length; k++) {
                    var isInCar = user.carrito?.findIndex(e=>(e?.producto as Producto)?._id=== dataProductsTemp[k]._id)
                    productTemp.push({
                        count: isInCar>-1?user.carrito[isInCar].cantidad:0,
                        _id: dataProductsTemp[k]._id
                    })
                }
            } 
        }else{
            for (let k = 0; k < dataProductsTemp.length; k++) {
                dataProductsTemp[k].precioDescuento=getNewPrice(0, dataProductsTemp[k].precio)
                var productsCombo = []
                var isInCar = user.carrito?.findIndex(e=>(e?.combo as ProductoCombo)?._id=== dataProductsTemp[k]._id)
                for (let m = 0; m < dataProductsTemp[k].producto.length; m++) {
                    productsCombo.push(` ${(dataProductsTemp[k].producto[m].producto as Producto).nombre} x${dataProductsTemp[k].producto[m].cantidad}U`)
                }
                productTemp.push({
                    count: isInCar>-1?user.carrito[isInCar].cantidad : 0,
                    _id: dataProductsTemp[k]._id
                })
                dataProductsTemp[k].descripcion= productsCombo.join()
            }
        }
        setProductCart(productTemp)
        setDataProductsToShow(dataProductsTemp)
        setDataProductsInit(dataProductsTemp)
        if (ofer) {
            if (titleInit==='promociones') {
                settitle(`Productos en promoción`)
            }else if (titleInit==='productos recomendados') {
                settitle(`Productos recomendados`)
            }else if (titleInit === 'combos') {
                settitle(`Combos`)
            }
            
        }else if (brand !=='') {
            settitle(`Productos de la marca: ${brand}`)
        }
        else{
            settitle(`Resultados de busqueda para: ${titleInit}`)
        }
        
    }, [user])

    //Functions

    //Addcart
    const addCart = async (id:string, e)=>{
        e.stopPropagation();
        if (user.jwt) {
            var tempCartProducts: Count[] = JSON.parse(JSON.stringify(productCart))
            var carrito: Carrito[] = user.carrito
            var index = tempCartProducts.findIndex(e=>e._id === id)
            var posProduct = dataProducts.findIndex(e=>e._id===id)
            var count = tempCartProducts[index].count += 1
            if (titleInit !== 'combos') {
                var isProdcut = user.carrito.findIndex(e=>(e?.producto as Producto)?._id === id)
                if (isProdcut >-1) {
                    carrito[isProdcut].cantidad = tempCartProducts[index].count
                }else{
                    carrito.push({cantidad:count, producto: tempCartProducts[index]._id, peso: dataProducts[posProduct].peso, precio: dataProducts[posProduct].precio})
                }
                
            }else{
                var isProdcut = user.carrito.findIndex(e=>(e?.combo as ProductoCombo)?._id === id)
                if (isProdcut >-1) {
                    carrito[isProdcut].cantidad = tempCartProducts[index].count
                }else{
                    carrito.push({cantidad:count, combo: tempCartProducts[index]._id, peso: dataProducts[posProduct].peso, precio: dataProducts[posProduct].precio})
                } 
            }
            await updatecart(carrito)
            setProductCart(tempCartProducts)
        }
    }

    //remove Cart 
    const removeCart = async (id:string, e)=>{
        e.stopPropagation();
        if (user.jwt) {
            var tempCartProducts: Count[] = JSON.parse(JSON.stringify(productCart))
            var index = tempCartProducts.findIndex(e=>e._id === id)
            var carrito: Carrito[] = user.carrito
            
            var posProduct = dataProducts.findIndex(e=>e._id===id)
            if (tempCartProducts[index].count>0) {
                var count = tempCartProducts[index].count -= 1
                if (titleInit !== 'combos') {
                    var isProdcut = user.carrito.findIndex(e=>(e?.producto as Producto)?._id === id)
                    if (count > 0) {
                        if (isProdcut>-1) {
                            carrito[isProdcut].cantidad = count
                        }else{
                            carrito.push({cantidad:count, producto: tempCartProducts[index]._id, peso: dataProducts[posProduct].peso, precio: dataProducts[posProduct].precio})
                        }
                    }else{
                        carrito.splice(isProdcut,1)
                    }
                }else{
                    var isProdcut = user.carrito.findIndex(e=>(e?.combo as ProductoCombo)?._id === id)
                    if (count > 0) {
                        if (isProdcut>-1) {
                            carrito[isProdcut].cantidad = count
                        }else{
                            carrito.push({cantidad:count, combo: tempCartProducts[index]._id, peso: dataProducts[posProduct].peso, precio: dataProducts[posProduct].precio})
                        }
                    }else{
                        carrito.splice(isProdcut,1)
                    }
                }
                await updatecart(carrito)
                setProductCart(tempCartProducts)                
            }
        }
    }

    //call Cart 
    const updatecart = async (carrito: Carrito[]) =>{
        axios.put(`${url}/users/${user._id}`,{
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

    const openProduct = (id:string) => {
        setIdProductModal(id)
        setOpenModalProduct(true)
    }

    const openAuth = (e) =>{
        e.stopPropagation();
        setModalAuthSignIn(true)
    }


    const filter = (parameter:string) => {
        var productsTemp = JSON.parse(JSON.stringify(dataProductsInit))
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

    //get countCart
    const getCountCart = (id:string) =>{
        if (productCart.length>0) {
            var index = productCart.findIndex(e=>e._id===id)
            return productCart[index].count
        }
        
    }

    return(
        <Layout isCombo={titleInit!=='combos'?false:true} setOpenModalProduct={setOpenModalProduct} openModalProduct={openModalProduct} idProduct={idProductModal} urlBack={url}  logoWhite={false} pathPublic={'../'} title={title} color={"#8D8D8D"}  background={`#EEEEEE`}>
            <div className='productMain'>
                <div className='productLeft'>
                    <div className='filter'>
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
                <div className='productRight'>
                    <div>
                        <div className='firstTarget'>
                            <div className='textCategory'>
                                <h1>{title} </h1>
                            </div>
                                
                        </div>
                    <div className='row rowTarget'>
                        {dataProductsToShow.length >0 ? dataProductsToShow.map(product=>{
                            return (
                            <div onClick={()=>openProduct(product._id)} className='col-lg-4 mainTargetProduct' key={product._id}>
                                <div className='targetProduct'>
                                        <div className="imgProduct">
                                            <img src={`${url}${product.imagenes.url}`} alt={`${product.nombre} mercatto`}/>
                                        </div>
                                        <div className="targetText">
                                            <div>
                                                <p className='productName'>{product.nombre}</p>
                                            </div>
                                            <div className='containerPrice'>
                                                <span className='productPrice'>${formatNumber(product.precioDescuento)}</span> {product.descuento>0 ? <span className='productDescuento'>${formatNumber(product.precio)}</span> : null}
                                            </div>
                                            <div>
                                                <span className='productDescription'>{product.descripcion}</span>
                                            </div>
                                            <div className='addCart'>
                                                        {user.jwt?
                                                            <>
                                                                <span>{getCountCart(product._id)}</span>
                                                                <button onClick={(e)=>removeCart(product._id,e)} className='buttonCount'>
                                                                    <span>-</span>
                                                                </button>
                                                                <button onClick={(e)=>addCart(product._id, e)} className='buttonCount'>
                                                                    <span>+</span>
                                                                </button>
                                                            </>
                                                        :
                                                    <button onClick={openAuth} className='buttonAdd'>Agregar</button>
                                                }
                                                
                                            </div>
                                        </div>
                                        {product.descuento>0?
                                            <div className='desc'>
                                                <span>%{product.descuento}</span>
                                            </div>
                                        :null} 
                                </div>
                            </div>
                        )}):
                        <div className='empty'>
                            <h2>No existen Productos relacionados con tu busqueda</h2>
                            <FrownOutlined />
                            <br/>
                            <Link href={'/'}>
                                <a>
                                    <button>Regresar</button>
                                    
                                </a>
                            </Link>
                        </div>}
                    </div>
                    </div>                       
                </div>
            </div>
        </Layout>
    )
}

export async function getServerSideProps (ctx) {
    const URL = process.env.URL_STRAPI;
    var dataProducts 
    if (ctx.query.ofer) {
        if (ctx.query.product === 'combos') {
            dataProducts = await fetch(`${URL}/combos`,{method: 'GET'})
        }else{
            dataProducts = await fetch(`${URL}/productos?${ctx.query.product}`,{method: 'GET'})
        }
    }else if (ctx.query.brand) {
            dataProducts = await fetch(`${URL}/productos?brand=${ctx.query.product}`,{method: 'GET'})
    }else{
        dataProducts = await fetch(`${URL}/productos?search_product=${ctx.query.product}`,{method: 'GET'})
    }
    const jsonProducts = await dataProducts.json()
    return {props: {url:URL, dataProducts: jsonProducts, titleInit: ctx.query.product, ofer: ctx.query.ofer? true : false, brand: ctx.query.brand? ctx.query.brand:""}}
}

export default ProductSearchComponent