import React, {useState, useEffect, Dispatch, SetStateAction} from 'react'
//reactImg
import InnerImageZoom from 'react-inner-image-zoom';
//AntDesign 
import { Modal} from 'antd'
//provider
import useAuth from '../providers/AuthProvider'
//axios
import axios from 'axios'
//utils
import { getNewPrice } from '../utils/functions';
//types
import { Carrito, Producto } from '../utils/types'
import { count } from 'console';
type PropsModal = {
    id: string
    openModalProduct? :boolean
    setOpenModalProduct?: Dispatch<SetStateAction<boolean>>
    urlBack: string
}


const ModalProduct = (props:PropsModal) => {

    const {id, openModalProduct, setOpenModalProduct, urlBack} = props

    //Providers
    const {user ,setModalAuthSignIn,updateUser } = useAuth()

    //state
    const [dataProduct, setDataProduct] = useState<Producto>()
    const [loading, setLoading] = useState<boolean>(true)
    const [countProduct, setCountProduct] = useState<number>(null)

    //effect
    useEffect(() => {
        setLoading(true)
        if (openModalProduct) {
            axios.get(`${urlBack}/productos/${id}`)
            .then(res=>{
                res.data.precioDescuento = getNewPrice(res.data.descuento, res.data.precio)
                var countCart = user.carrito.findIndex(e=>(e.producto as Producto)._id === res.data.id)
                setCountProduct(countCart>-1?user.carrito[countCart].cantidad:0)
                setDataProduct(res.data)
                setLoading(false)

            })
            .catch(err=>console.log(err))
        }
    }, [openModalProduct])


    //functions
     const HandleClose = ()=>{
        setOpenModalProduct(false)
        Modal.destroyAll()
    }

    const openAuth = () =>{
        setOpenModalProduct(false)
        setModalAuthSignIn(true)
    }
    
    const addCount = async() => {
        if (user.jwt) {
            var carrito: Carrito[] = user.carrito
            var isProduct = user.carrito.findIndex(e=>(e.producto as Producto)._id === dataProduct._id)
            var count = countProduct + 1
            if (isProduct >-1) {
                carrito[isProduct].cantidad = count
            }else{
                carrito.push({cantidad:count, producto: dataProduct._id, peso: dataProduct.peso, precio: dataProduct.precio})
            }
            updateCart(carrito)
            setCountProduct(count)
        }
    }

    const removeCount = async() =>{
        if (user.jwt) {
            var carrito: Carrito[] = user.carrito
            var isProduct = user.carrito.findIndex(e=>(e.producto as Producto)._id === dataProduct._id)
            if (countProduct>0) {
                var count = countProduct -1
                if (count>0) {
                    if (isProduct>-1) {
                        carrito[isProduct].cantidad = count
                    }else{
                        carrito.push({cantidad:count, producto: dataProduct._id, peso: dataProduct.peso, precio: dataProduct.precio})
                    }
                }else{
                    carrito.splice(isProduct,1)
                }
                await updateCart(carrito)
                setCountProduct(count)
            }
        }
    }

    const updateCart = async(carrito: Carrito[]) =>{
        axios.put(`${urlBack}/users/${user._id}`,{
            carrito:carrito
        },{
            headers:{
                Authorization: `Bearer ${user.jwt}`
            }
        }).then(res=>{
            updateUser(res)
        }).catch(err=>console.log(err))
    }
    return(
        <Modal width={800} centered onCancel={HandleClose} visible={openModalProduct}>
            <div className='containerProductModal'>
                {!loading?
                <>
                    <div className='imgProduct'>
                        <InnerImageZoom alt={`Mercatto ${dataProduct.nombre}`} src={`${urlBack}${dataProduct.imagenes.url}`}/> 
                    </div>
                    <div className='productInfo'>
                        <div className='productName'>
                            <h1>{dataProduct.nombre}</h1>
                        </div>
                        <div className='productDescription'> 
                            <p>{dataProduct.descripcion}</p>
                        </div>
                        <div className='productPrice'>
                            <p>${dataProduct.precioDescuento}</p>{dataProduct.descuento>0? <p style={{textDecoration:'line-through', fontSize:'2em'}} className='priceNormal'>${dataProduct.precio}</p> :null}
                        </div>
                        <div className='productCart'>
                            {!user.jwt?
                            <button onClick={openAuth} className='addCart'>
                                Añadir 
                            </button>
                            :
                            <>
                                <span>{countProduct}</span>
                                <button onClick={removeCount} className='less'>-</button>
                                <button onClick={addCount} className='plus'>+</button>
                            </>
                            }
                        </div>
                    </div>
                </>
                :null}
            </div>
        </Modal>
    )
}

export default React.memo(ModalProduct)