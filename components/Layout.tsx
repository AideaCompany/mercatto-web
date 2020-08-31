//nextjs
import Link from 'next/link'
//antD
import {AutoComplete, Input, Badge, Avatar} from 'antd'
import {SearchOutlined, ShoppingCartOutlined, UserOutlined} from '@ant-design/icons';
const Layout = ():JSX.Element =>{
    return(
        <main>
            <div className='mainLayout'>
                <div style={{backgroundColor:'#EEEEEE'}} className='leftContainer'>
                    <div className='containerLogos'>
                        <img className='logoBack' src="./images/Layout/mercatto-white.svg" alt="mercatto logo"/>
                        <Link href='/'>
                            <a >
                                <img className='mainLogo' src="./images/Layout/mercatto-logo-large.svg" alt="mercatto logo"/>
                            </a>
                        </Link>
                        
                    </div>
                </div>
                <div className='rigthContainer'>
                    <div className='topContainer'>
                        <div className='searchBar'>
                            <AutoComplete>
                                <Input prefix={<SearchOutlined />} placeholder={"Buscar"}></Input>
                            </AutoComplete>
                        </div>
                        <div className='socialMedia'>
                                <a href="/"><img src="./images/Layout/facebook.svg" alt="facebook mercatto"/></a>
                                <a href="/"><img src="./images/Layout/instagram.svg" alt="facebook mercatto"/></a>
                                <a href="/"><img src="./images/Layout/whatsapp.svg" alt="facebook mercatto"/></a>
                        </div>
                        <div className='menu'>
                            <Link href='/'>
                                <a>
                                    Categorías
                                </a>
                            </Link>
                            <Link href='/'>
                                <a>
                                    Productos
                                </a>
                            </Link>
                            <Badge count={1}>
                                <ShoppingCartOutlined className='iconCart' />
                            </Badge>
                            <Avatar size={40} className='profileUser' icon={<UserOutlined />}>
                            </Avatar>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Layout