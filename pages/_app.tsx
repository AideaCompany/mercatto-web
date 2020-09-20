import '../styles/globals.css'
import '../styles/Layout.scss'
import '../styles/pages/Index.scss'
import '../styles/pages/Auth.scss'
import '../styles/pages/Category.scss'
import '../styles/pages/Products.scss';
import '../styles/pages/Carrito.scss';
import '../styles/pages/Pedidos.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/antd.css';
import '@brainhubeu/react-carousel/lib/style.css';

//framer-motion
import {AnimatePresence} from 'framer-motion'
//Providers
import {AuthProvider} from '../providers/AuthProvider'

function MyApp({ Component, pageProps, router }) {
  return (
    
      <AuthProvider>
        <AnimatePresence  key={router.route}  exitBeforeEnter={true}>
          <Component {...pageProps} />
        </AnimatePresence>
      </AuthProvider>
    
  )
}

export default MyApp
