import Layout from '../components/Layout';
//Marked
import marked from 'marked'
//Antd
import {SecurityScanOutlined} from '@ant-design/icons';

type Terms = {
    terminos_condiciones: string
}

const TerminosCondiciones = (props:{dataTerms: Terms})=>{

    const {dataTerms} = props

    const getMarkdownText = () =>{
        var rawMarkUp = marked(dataTerms.terminos_condiciones, {sanitize: true})
        return rawMarkUp
    }
    console.log(getMarkdownText)


    return(
        <Layout  background={"#EEEEEE"} color={"#8D8D8D"} pathPublic="../../" title='Terminos y condiciones'>
            <div className='mainTerminos'>
                <div className='termsLeft'>
                    <SecurityScanOutlined />
                </div>
                <div className='termsRight'>
                    <div className='containerText' dangerouslySetInnerHTML={{__html:getMarkdownText()}}>
                    </div>
                </div>
            </div>
        </Layout>
    )

}

export async function getServerSideProps (ctx) {
    const URL = process.env.URL_STRAPI;
    const resTerms = await fetch(`${URL}/terminos-y-condiciones`,{method: 'GET'})
    const dataTerms = await resTerms.json()
    return {props: {dataTerms: dataTerms}}
}

export default TerminosCondiciones