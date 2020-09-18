import '../styles/globals.css'
import '../styles/Layout.scss'
import '../styles/pages/Index.scss'
import '../styles/pages/Auth.scss'
import '../styles/pages/Category.scss'
import '../styles/pages/Products.scss';
import '../styles/pages/Carrito.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/antd.css';
import '@brainhubeu/react-carousel/lib/style.css';
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
