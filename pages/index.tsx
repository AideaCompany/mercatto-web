import {useEffect, useState} from 'react'
//Layout
import Layout from '../components/Layout'
//nextjs
import Link from 'next/link'
import {useRouter} from 'next/router'
//provider
import useAuth from '../providers/AuthProvider'
import Carousel from '@brainhubeu/react-carousel';
import { useScroll } from 'react-use-gesture';

//Types
// import {Producto, Carrito} from '../utils/types'

// import {Button, message} from 'antd'
// import axios from 'axios'


//types
type Categorias = {
  Categoria: string
  _id: string
  portada: {url: string}
  main_color: string
  contraste_oscuro: boolean
}


type Ofertas = {
  _id: string
  Ofertas: {
    _id: string
    ref: Ref
  }[]
}

type Ref = {
    _id: string
    titulo: string
    imagen: {url: string}
}

type Marcas = {
  _id: string
  nombre: string
  logo: {url:string}
}

function Home(props:{dataCategoria:Categorias[], dataOfertas?:Ofertas[], dataMarcas?:Marcas[] ,urlBack?:string, confirmed:boolean, code?:string, tokenProvider?: string}):JSX.Element {
  //props
  const {dataCategoria, urlBack, confirmed, code, tokenProvider, dataOfertas, dataMarcas} = props

  //Provider
  const {user ,setModalAuthSignIn,updateUser } = useAuth()
  const router = useRouter()
  //state
  const [dataOfertaFinal, setDataOfertaFinal] = useState<Ofertas>()

  //effect
  useEffect(() => {
    setDataOfertaFinal(dataOfertas[0])
    // var productTemp: countProduct[] = []
    // dataProductos.map(e=>e.precioDescuento=getNewPrice(e.descuento,e.precio))
    // for (let k = 0; k < dataProductos.length; k++) {
    //   productTemp.push({
    //     count: 0,
    //     _id: dataProductos[k]._id
    //   })
    // }
    // setCartProducts(productTemp)
  }, [])

  //functions
  // const plusProduct = (id:string) =>{
  //   var tempCartProducts : countProduct[] = JSON.parse(JSON.stringify(cartProducts))
  //   var index = tempCartProducts.findIndex(e=> e._id === id)
  //   tempCartProducts[index].count += 1
  //   setCartProducts(tempCartProducts)
  // }

  // const minusProduct = (id:string)=>{
  //   var tempCartProducts : countProduct[] = JSON.parse(JSON.stringify(cartProducts))
  //   var index = tempCartProducts.findIndex(e=> e._id === id)
  //   if (tempCartProducts[index].count>0) {
  //     tempCartProducts[index].count -= 1
  //   }
  //   setCartProducts(tempCartProducts)
  // }

  // const addProduct = (id:string)=>{
  //   var tempCartProducts : countProduct[] = JSON.parse(JSON.stringify(cartProducts))
  //   var index = tempCartProducts.findIndex(e=> e._id === id)
  //   if (user.jwt && tempCartProducts[index].count>0) {
  //     var carrito: Carrito[] = user.carrito
  //     var isProdcut = user.carrito.findIndex(e=>(e.producto as Producto)._id === id)
  //     if (isProdcut >-1) {
  //       carrito[isProdcut].cantidad += tempCartProducts[index].count
  //     }else{
  //       carrito.push({cantidad:tempCartProducts[index].count, producto: tempCartProducts[index]._id })
  //     }
  //     axios.put(`${urlBack}/users/${user._id}`,{
  //       carrito: carrito
  //     },
  //     {
  //       headers: {
  //         Authorization: `Bearer ${user.jwt}`
  //       }
  //     }
  //     ).then(res=>{
  //       message.success({content:"Producto agregado",className: 'messageVerification',duration: '5'})
  //       updateUser(res)})
  //      .catch(err=>{
  //        console.log(err)
  //      })
  //   }else if (tempCartProducts[index].count==0) {
  //     message.info({content:"Porfavor indica la cantidad",className: 'messageVerification',duration: '5'})
  //   }else{
  //     message.info({content:"Porfavor inicia sesión para usar el carrito",className: 'messageVerification',duration: '5'})
  //     setModalAuthSignIn(true)
  //   }
  // }
  return (
    <div>
      <Layout tokenProvider={tokenProvider} logoWhite={false} pathPublic={'./'} code={code} confirmed={confirmed} urlBack={urlBack} title='Categorías' color='#8D8D8D' background='#EEEEEE'>
        <>
          <h2 className='titleOfertas'>Especiales para ti</h2>
          <div className='offer'>  
            <Carousel animationSpeed={500} arrows={true} infinite={true}  draggable={true} slidesPerPage={1} >
                {dataOfertaFinal?.Ofertas?.map(oferta=> {
                  return(
                  <div className='targetOffer'>
                    <h2>{oferta.ref.titulo}</h2>
                    <img src={`${urlBack}${oferta.ref.imagen.url}`} alt={`Mercatto ${oferta.ref.titulo}`}/>
                    <div className='back'></div>
                </div>
                )})}
            </Carousel>
          </div>
          <h2 className='titleBrand'>Trabajamos con las siguientes marcas</h2>
          <div className='brands'>
            <Carousel arrows={true} infinite={true} slidesPerPage={3}>
              {dataMarcas?.map(marca=>(
                <div className='targetBrand'>
                  <img src={`${urlBack}${marca.logo.url}`} alt={`Mercatto ${marca.nombre}`}/>
                </div>
              ))}
            </Carousel>
          </div>
          <h1 className='titleCategorias'>Categorias</h1>
          <div className='categoriesTargets'>
            <Carousel minDraggableOffset={20} draggable={dataCategoria.length>3? true : false} slidesPerPage={3} infinite={false}>
              {dataCategoria?.map((categories)=>{
                return(
                  <Link  href={{pathname:`/categorias/${categories.Categoria.toLowerCase()}`, query:{id:categories._id}}}>
                    <a className={`${categories._id} categoryTarget`}>
                      <div >
                        <img src={`${urlBack}${categories.portada.url}`} alt={`${categories.Categoria}`}/>
                        <h2>{categories.Categoria}</h2>
                      </div>
                    </a>
                  </Link>
                    
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
  const resOfertas = await fetch(`${URL}/ofertas`,{method: 'GET'})
  const resMarcas = await fetch(`${URL}/marcas`, {method: 'GET'})
  const jsonMarcas =  await resMarcas.json()
  const jsonCategorias = await resCategorias.json()
  const jsonOfertas = await resOfertas.json()
  const tokenProvider =  ctx.query.access_token ? ctx.query.access_token : ""
  return {props:{dataCategoria : jsonCategorias, urlBack: URL, dataOfertas:jsonOfertas, dataMarcas : jsonMarcas, confirmed: confirmed, code: code, tokenProvider: tokenProvider }}
}

export default Home