import '../styles/globals.scss'
import '../styles/Layout.scss'
import '../styles/pages/Index.scss'
import '../styles/pages/Auth.scss'
import '../styles/pages/Category.scss'
import '../styles/pages/Carrito.scss';
import '../styles/pages/Pedidos.scss';
import '../styles/pages/Terminos.scss'
import '../styles/Product.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.min.css';
import 'antd/dist/antd.css';
import '@brainhubeu/react-carousel/lib/style.css';
import 'antd-mobile/lib/carousel/style/index.css'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

//Providers
import {AuthProvider} from '../providers/AuthProvider'

function MyApp({ Component, pageProps }) {
  return (
    
      <AuthProvider>
          <Component {...pageProps} />
      </AuthProvider>
    
  )
}

export default MyApp
