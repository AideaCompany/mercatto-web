import {useEffect, useState} from 'react'
//Layout
import Layout from '../components/Layout'
//nextjs
import {useRouter} from 'next/router'
//provider
import useAuth from '../providers/AuthProvider'
import Carousel from '@brainhubeu/react-carousel';
//utils
import {hexToRgb, getNewPrice} from '../utils/functions'
//Types
import {Producto, Carrito} from '../utils/types'

import {Button, message} from 'antd'
import axios from 'axios'


//types
type Categorias = {
  Categoria: string
  _id: string
  portada: {url: string}
  main_color: string
  contraste_oscuro: boolean
}
type countProduct = {
  _id: string
  count : number
}


function Home(props:{dataCategoria:Categorias[], dataProductos:Producto[], urlBack?:string, confirmed:boolean, code?:string, tokenProvider?: string}):JSX.Element {
  //props
  const {dataCategoria, urlBack, dataProductos, confirmed, code, tokenProvider} = props

  //Provider
  const {user ,setModalAuthSignIn,updateUser } = useAuth()
  const router = useRouter()

  //State
  const [cartProducts, setCartProducts] = useState<countProduct[]>([])


  //effect
  useEffect(() => {
    var productTemp: countProduct[] = []
    dataProductos.map(e=>e.precioDescuento=getNewPrice(e.descuento,e.precio))
    for (let k = 0; k < dataProductos.length; k++) {
      
      productTemp.push({
        count: 0,
        _id: dataProductos[k]._id
      })
    }
    setCartProducts(productTemp)
  }, [])

  //functions
  const plusProduct = (id:string) =>{
    var tempCartProducts : countProduct[] = JSON.parse(JSON.stringify(cartProducts))
    var index = tempCartProducts.findIndex(e=> e._id === id)
    tempCartProducts[index].count += 1
    setCartProducts(tempCartProducts)
  }

  const minusProduct = (id:string)=>{
    var tempCartProducts : countProduct[] = JSON.parse(JSON.stringify(cartProducts))
    var index = tempCartProducts.findIndex(e=> e._id === id)
    if (tempCartProducts[index].count>0) {
      tempCartProducts[index].count -= 1
    }
    setCartProducts(tempCartProducts)
  }

  const addProduct = (id:string)=>{
    var tempCartProducts : countProduct[] = JSON.parse(JSON.stringify(cartProducts))
    var index = tempCartProducts.findIndex(e=> e._id === id)
    if (user.jwt && tempCartProducts[index].count>0) {
      var carrito: Carrito[] = user.carrito
      var isProdcut = user.carrito.findIndex(e=>(e.producto as Producto)._id === id)
      if (isProdcut >-1) {
        carrito[isProdcut].cantidad += tempCartProducts[index].count
      }else{
        carrito.push({cantidad:tempCartProducts[index].count, producto: tempCartProducts[index]._id })
      }
      axios.put(`${urlBack}/users/${user._id}`,{
        carrito: carrito
      },
      {
        headers: {
          Authorization: `Bearer ${user.jwt}`
        }
      }
      ).then(res=>{
        message.success({content:"Producto agregado",className: 'messageVerification',duration: '5'})
        updateUser(res)})
       .catch(err=>{
         console.log(err)
       })
    }else if (tempCartProducts[index].count==0) {
      message.info({content:"Porfavor indica la cantidad",className: 'messageVerification',duration: '5'})
    }else{
      message.info({content:"Porfavor inicia sesión para usar el carrito",className: 'messageVerification',duration: '5'})
      setModalAuthSignIn(true)
    }
  }
  return (
    <div>
      <Layout tokenProvider={tokenProvider} logoWhite={false} pathPublic={'./'} code={code} confirmed={confirmed} urlBack={urlBack} title='Categorías' color='#8D8D8D' background='#EEEEEE'>
        <>
          <div className='offer'>
            <h2>Ofertas y recomendaciones</h2>
            {dataProductos.length>4 ? <span className='alertDrag'>Arrastra hacia la izquierda</span>: null}
            <Carousel arrows={dataProductos.length>4? true: false} draggable={dataProductos.length>4? true : false} slidesPerPage={4}>
              {dataProductos?.map((products,i)=>(
                <div className='targetProductsIndex'>
                  {products.descuento > 0 ? <span className='productDescuento'>{`$${products.precio}`}</span> : null }
                <span className='productPrice'>{`$${products.precioDescuento}` } {products.descuento > 0 ? <span style={{fontSize:'0.7vw', color:'#01A22F'}}>{products.descuento}% OFF</span> : ''}</span> 
                  <h3 style={{padding:'1em'}}>{products.nombre} - {products.peso}</h3>
                  <img src={`${urlBack}${products.imagenes.url}`} alt={products.nombre}/>
                  <div>
                    <div onClick={()=>minusProduct(products._id)} className='less'>-</div>
                    <span>{cartProducts[i]?.count}</span>
                    <div onClick={()=>plusProduct(products._id)} className='plus'>+</div>
                  </div>
                  <Button onClick={()=>addProduct(products._id)}>Agregar al carrito</Button>
                </div>
              ))}
            </Carousel>
          </div>
          <div className='categoriesTargets'>
            <Carousel  minDraggableOffset={20} draggable={dataCategoria.length>3? true : false} slidesPerPage={3} infinite={false}>
              {dataCategoria?.map((categories)=>{
                return(
                    <div onClick={()=>router.push({pathname:`/categorias/${categories.Categoria}`, query:{id:categories._id, cr: categories.main_color.split('#')[1], cn: categories.contraste_oscuro}})} style={{background: hexToRgb(categories.main_color)}} className={`${categories._id} categoryTarget`}>
                      <img src={`${urlBack}${categories.portada.url}`} alt={`${categories.Categoria}`}/>
                      <h2 style={{color:`${categories.contraste_oscuro ? '#8D8D8D':'#ffffff'}`}}>{categories.Categoria}</h2>
                    </div>
              )})}
            </Carousel>
          </div>
        </>
      </Layout>
    </div>
  )
}


export async function getServerSideProps (ctx) {
  var confirmed:boolean = ctx.query.confirmed === "true" ? true : false
  var code:string = ctx.query.code  ? ctx.query.code : ""
  const URL = process.env.URL_STRAPI;
  const resCategorias = await fetch(`${URL}/categorias`,{method: 'GET'})
  const resProductos = await fetch(`${URL}/productos?recomended`,{method: 'GET'})
  const jsonCategorias = await resCategorias.json()
  const jsonProdcutos = await resProductos.json()
  const tokenProvider =  ctx.query.access_token ? ctx.query.access_token : ""
  return {props:{dataCategoria : jsonCategorias, urlBack: URL, dataProductos:jsonProdcutos, confirmed: confirmed, code: code, tokenProvider: tokenProvider }}
}

export default Home