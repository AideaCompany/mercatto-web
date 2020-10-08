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
import { Carrito, Producto, ProductoCombo } from '../utils/types'

type PropsModal = {
    id: string
    openModalProduct? :boolean
    setOpenModalProduct?: Dispatch<SetStateAction<boolean>>
    urlBack: string,
    isCombo?: boolean
}


const ModalProduct = (props:PropsModal) => {

    const {id, openModalProduct, setOpenModalProduct, urlBack, isCombo} = props

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
            if (isCombo) {
                axios.get(`${urlBack}/combos/${id}`)
                .then(res=>{
                    res.data.precioDescuento = getNewPrice(0, res.data.precio)
                    var tempDesc = []
                    var products = (res.data.producto as ProductoCombo[])
                    for (let k = 0; k < products.length; k++) {
                        tempDesc.push(`${(products[k].producto as Producto).nombre} x${products[k].cantidad}U`)
                    }
                    res.data.descripcion = tempDesc.join(', ')
                    if (user.jwt) {
                        var countCart = user.carrito.findIndex(e=>(e.combo as ProductoCombo)?._id === res.data.id)
                        setCountProduct(countCart>-1?user.carrito[countCart].cantidad:0) 
                    }else{
                        setCountProduct(0) 
                    }
                    setDataProduct(res.data)
                    setLoading(false)
    
                })
                .catch(err=>console.log(err))
            }else{
                axios.get(`${urlBack}/productos/${id}`)
                .then(res=>{
                    res.data.precioDescuento = getNewPrice(res.data.descuento, res.data.precio)
                    if (user.jwt) {
                        var countCart = user.carrito.findIndex(e=>(e.producto as Producto)?._id === res.data.id)
                        setCountProduct(countCart>-1?user.carrito[countCart].cantidad:0) 
                    }else{
                        setCountProduct(0) 
                    }
                    setDataProduct(res.data)
                    setLoading(false)
    
                })
                .catch(err=>console.log(err))
            }

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
            var count = countProduct + 1
            if (!isCombo) {
                var isProduct = user.carrito.findIndex(e=>(e.producto as Producto)?._id === dataProduct._id)
                if (isProduct >-1) {
                    carrito[isProduct].cantidad = count
                }else{
                    carrito.push({cantidad:count, producto: dataProduct._id, peso: dataProduct.peso, precio: dataProduct.precio})
                }
            }else{
                var isProduct = user.carrito.findIndex(e=>(e.combo as ProductoCombo)?._id === dataProduct._id)
                if (isProduct >-1) {
                    carrito[isProduct].cantidad = count
                }else{
                    carrito.push({cantidad:count, combo: dataProduct._id, peso: dataProduct.peso, precio: dataProduct.precio})
                }
            }
            
            updateCart(carrito)
            setCountProduct(count)
        }
    }

    const removeCount = async() =>{
        if (user.jwt) {
            var carrito: Carrito[] = user.carrito

            if (countProduct>0) {
                var count = countProduct -1
                if (!isCombo) {
                    var isProduct = user.carrito.findIndex(e=>(e.producto as Producto)?._id === dataProduct._id)
                    if (count>0) {
                        if (isProduct>-1) {
                            carrito[isProduct].cantidad = count
                        }else{
                            carrito.push({cantidad:count, producto: dataProduct._id, peso: dataProduct.peso, precio: dataProduct.precio})
                        }
                    }else{
                        carrito.splice(isProduct,1)
                    }
                }else{
                    var isProduct = user.carrito.findIndex(e=>(e.combo as ProductoCombo)?._id === dataProduct._id)
                    if (count>0) {
                        if (isProduct>-1) {
                            carrito[isProduct].cantidad = count
                        }else{
                            carrito.push({cantidad:count, combo: dataProduct._id, peso: dataProduct.peso, precio: dataProduct.precio})
                        }
                    }else{
                        carrito.splice(isProduct,1)
                    }
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
                        {dataProduct.descuento>0?
                            <div className='off'>
                                <span>{dataProduct.descuento}%</span>
                            </div>
                        :null}
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