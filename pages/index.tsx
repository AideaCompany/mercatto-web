import {useEffect, useState} from 'react'
//Layout
import Layout from '../components/Layout'
//nextjs
import Link from 'next/link'
import {useRouter} from 'next/router'
//provider
import Carousel from 'react-multi-carousel';
import { Ofertas, DataOfer } from '../utils/types';

//types
type Categorias = {
  Categoria: string
  _id: string
  portada: {url: string}
  main_color: string
  contraste_oscuro: boolean
}



type Marcas = {
  _id: string
  nombre: string
  logo: {url:string}
}

function Home(props:{dataCategoria:Categorias[], dataOfertas?:Ofertas[], dataMarcas?:Marcas[] ,urlBack?:string, confirmed:boolean, code?:string, tokenProvider?: string}):JSX.Element {
  //props
  const {dataCategoria, urlBack, confirmed, code, tokenProvider, dataOfertas, dataMarcas} = props

  //priverder
  const router = useRouter()
  //state
  const [dataOfertaFinal, setDataOfertaFinal] = useState<Ofertas>()
  const [arrowOffer, setArrowOffer] = useState<boolean>(true)
  const [firstRender, setFirstRender] = useState(false)
  const [dots, setDots] = useState(false)
  const [openModalProduct, setOpenModalProduct] = useState(false)
  const [idProductModal, setIdProductModal] = useState<string>('')

  //effect
  useEffect(() => {
    setFirstRender(true)
    setDataOfertaFinal(dataOfertas[0])
    if (window.matchMedia("(max-width: 414px)").matches){
      setArrowOffer(false)
      setDots(true)
    }

    if (dataCategoria.length>3) {
      setDots(true)
    }
    
    const changeDots = () =>{
      if (window.innerWidth > 414 ) {
        setDots(false)
      }else{
        setDots(true)
      }
    }

    
    window.addEventListener('resize', changeDots)

    return () =>{
      window.removeEventListener('resize', changeDots)
    }
  }, [])


  const pushOffer = (oferta:DataOfer)=>{
    if (oferta.ref.productos.length === 0) {
      router.push({pathname:`/productos/${oferta.ref.titulo.toLowerCase()}`,query:{ofer:'yes'}})
    }else if (oferta.ref.productos.length === 1) {
      setIdProductModal(oferta.ref.productos[0]._id)
      setOpenModalProduct(true)
    }else{
      router.push({pathname:`/productos/${oferta.ref.titulo.toLowerCase()}`,query:{id_offer: oferta._id}})
    }
  }

  return (
    <div>
      <Layout openModalProduct={openModalProduct} setOpenModalProduct={setOpenModalProduct} idProduct={idProductModal} tokenProvider={tokenProvider} logoWhite={false} pathPublic={'./'} code={code} confirmed={confirmed} urlBack={urlBack} title='Categorías' color='#8D8D8D' background='#EEEEEE'>
        <>
        <div className='mainContainerCategory'>
          {/* Category Targets */}
          <div className='categoriesTargets'>
            <div>
            <h1 className='titleCategorias'>Categorias</h1>
              <Carousel 
                ssr
                partialVisbile={false}
                className='sliderCategory'
                draggable={true}  
                infinite={dataCategoria.length>3?true:false}
                autoPlay={false}
                arrows={false}
                
                additionalTransfrom={0}
                responsive={{
                  desktop:{
                    breakpoint:{max:3000, min: 700},
                    items:3
                  },
                  mobile:{
                    breakpoint:{max:464, min: 0},
                    items:1,
                    // partialVisibilityGutter: 10
                  },
                }}
                showDots={dots}
                slidesToSlide={1}
                swipeable
              >
                  {dataCategoria?.reverse()?.map((categories)=>{
                    return(
                      <Link key={categories._id} href={{pathname:`/categorias/${categories.Categoria.toLowerCase()}`, query:{id:categories._id}}}>
                        <a className={`${categories._id}`}>
                          <div className='categoryTarget' >
                            <img src={`${urlBack}${categories.portada.url}`} alt={`${categories.Categoria}`}/>
                            <h2>{categories.Categoria}</h2>
                          </div>
                        </a>
                      </Link> 
                  )})}
                </Carousel>
            </div>
          </div>
          <div className='offerBrand'>
            <div>
              {/* offer */}
              <div className='offer'>  
              <h2 className='titleOfertas'>Especiales para ti</h2> 
              {firstRender?
                <Carousel 
                ssr 
                autoPlay={false}
                draggable={true}  
                arrows={arrowOffer} 
                infinite={true}   
                className='offerSlider'
                responsive={{
                  desktop:{
                    breakpoint:{max:3000, min: 0},
                    items:1
                  },
                }}
                >
                    {dataOfertaFinal?.Ofertas?.map(oferta=> {
                      return(
                      <div onClick={()=>pushOffer(oferta)} className='targetOffer'>
                        <h2>{oferta.ref.titulo}</h2>
                        <img src={`${urlBack}${oferta.ref.imagen.url}`} alt={`Mercatto ${oferta.ref.titulo}`}/>
                        <div className='back'></div>
                    </div>
                    )})}
                </Carousel>
              :null}

              </div>

              {/* brands */}
              <div className='brands'>
                <h2 className='titleBrand'>Trabajamos con las siguientes marcas</h2>
                {
                  firstRender?
                  <Carousel 
                  ssr 
                  autoPlay={false}
                  draggable={true}  
                  arrows={arrowOffer} 
                  infinite={true}   
                  className='sliderBrand'
                  responsive={{
                    desktop:{
                      breakpoint:{max:3000, min: 0},
                      items:3
                    },
                  }}
                  >
                    {dataMarcas?.map(marca=>(
                      <div style={{display:'flex'}}>
                      <Link href={{pathname:`/productos/${marca._id}`, query:{brand:marca.nombre}}}>
                        <a key={marca._id} className='targetBrand'>
                            <img src={`${urlBack}${marca.logo.url}`} alt={`Mercatto ${marca.nombre}`}/>
                        </a>
                      </Link>
                      </div>
                      
                    ))}
                  </Carousel>
                  :
                  null
                }

              </div>
            </div>
          </div>
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