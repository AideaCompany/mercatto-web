
//Layout
import Layout from '../components/Layout'
//nextjs
import Link from 'next/link'
//Carousel
import Carousel from '@brainhubeu/react-carousel';
//utils
import {hexToRgb} from '../utils/functions'
//Antd
import {Button} from 'antd'
//Framer-motion
import {motion} from 'framer-motion'


//types
type Categorias = {
  Categoria: string
  _id: string
  portada: {url: string}
  main_color: string
  contraste_oscuro: boolean
}

type Productos = {
  descripcion: string
  _id: string
  imagenes: {url: string}
  precio: number
  nombre: string
}

function Home(props:{dataCategoria:Categorias[], dataProductos:Productos[], urlBack?:string, confirmed:boolean, code?:string, tokenProvider?: string}):JSX.Element {
  //props
  const {dataCategoria, urlBack, dataProductos, confirmed, code, tokenProvider} = props


  return (
    <motion.div exit={{opacity:0}} initial="initial" animate="animate">
      <Layout tokenProvider={tokenProvider} logoWhite={false} pathPublic={'./'} code={code} confirmed={confirmed} urlBack={urlBack} title='Categorías' color='#8D8D8D' background='#EEEEEE'>
        <>
          <div className='offer'>
            <h2>Ofertas y recomendaciones</h2>
            {dataProductos.length>4 ? <span className='alertDrag'>Arrastra hacia la izquierda</span>: null}
            <Carousel draggable={dataProductos.length>4? true : false} slidesPerPage={4}>
              {dataProductos.map(products=>(
                <div className='targetProductsIndex'>
                  <span className='productDescription'>{`${products.descripcion}`}</span>
                  <span className='productPrice'>{`$${products.precio.toString()}`}</span>
                  <h3>{products.nombre}</h3>
                  <img src={`${urlBack}${products.imagenes.url}`} alt={products.nombre}/>
                  <div>
                    <div className='plus'>+</div>
                    <span>1</span>
                    <div className='less'>-</div>
                  </div>
                  <Button>Agregar al carrito</Button>
                </div>
              ))}
            </Carousel>
          </div>
          <div className='categoriesTargets'>
            <Carousel minDraggableOffset={15} draggable={dataCategoria.length>3? true : false} slidesPerPage={3} infinite={false}>
              {dataCategoria.map((categories)=>{
                return(
                <Link key={categories._id} href={{pathname:`/categorias/${encodeURIComponent(categories.Categoria)}`, query:{id:categories._id, cr: categories.main_color.split('#')[1], cn: categories.contraste_oscuro} }}>
                  <a>
                    <div style={{background: hexToRgb(categories.main_color)}} className={`${categories._id} categoryTarget`}>
                      <img src={`${urlBack}${categories.portada.url}`} alt={`${categories.Categoria}`}/>
                      <h2 style={{color:`${categories.contraste_oscuro ? '#8D8D8D':'#ffffff'}`}}>{categories.Categoria}</h2>
                    </div> 
                  </a>     
                </Link>
              )})}
            </Carousel>
          </div>
        </>
      </Layout>
    </motion.div>
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