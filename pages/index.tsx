// import {useEffect} from 'react'
//Layout
import Layout from '../components/Layout'
//Carousel
import Carousel from '@brainhubeu/react-carousel';
//utils
import {hexToRgb} from '../utils/functions'

type Categorias = {
  Categoria: string
  _id: string
  portada: {url: string}
  main_color: string
}

type Productos = {
  descripcion: string
  _id: string
  imagenes: {url: string}
  precio: number
  nombre: string
}

function Home(props:{dataCategoria:Categorias[], dataProductos:Productos[], urlBack:string}):JSX.Element {
  const {dataCategoria, urlBack, dataProductos} = props
  return (
    <div>
      <Layout title='Categorías' color='#8D8D8D' background='#EEEEEE'>
        <>
          <div className='offer'>
            <h2>Ofertas y recomendaciones</h2>
            <Carousel draggable={dataProductos.length>6? true : false} slidesPerPage={6}>
              {dataProductos.map(products=>(
                <div className='targetProductsIndex'>
                  <span>{`$${products.precio.toString()}`}</span>
                  <h3>{products.nombre}</h3>
                  <img src={`${urlBack}${products.imagenes.url}`} alt={products.nombre}/>
                </div>
              ))}
            </Carousel>
          </div>
          <div className='categoriesTargets'>
            <Carousel minDraggableOffset={15} draggable={dataCategoria.length>3? true : false} slidesPerPage={3} infinite={false}>
              {dataCategoria.map(categories=>(
                <div style={{background: hexToRgb(categories.main_color)}} className={`${categories._id} categoryTarget`}>
                  <img src={`${urlBack}${categories.portada.url}`} alt={`${categories.Categoria}`}/>
                  <h2>{categories.Categoria}</h2>
                </div>
              ))}
            </Carousel>
          </div>
        </>
      </Layout>
    </div>
  )
}


Home.getInitialProps = async (ctx) =>{
  const URL = process.env.URL_STRAPI;
  const resCategorias = await fetch(`${URL}/categorias`,{method: 'GET'})
  const resProductos = await fetch(`${URL}/productos?recomended`,{method: 'GET'})
  const jsonCategorias = await resCategorias.json()
  const jsonProdcutos = await resProductos.json()
  return {dataCategoria : jsonCategorias, urlBack: URL, dataProductos:jsonProdcutos}
}

export default Home