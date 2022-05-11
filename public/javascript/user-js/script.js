// const { response } = require("../../../app")

// const { response } = require("../../../app")



function addToCart(proId){

    Swal.fire({
        title: 'Item added to Cart',
        icon: 'success',
        iconColor:'#bf0f0f',
        showCancelButton: false,
        confirmButtonColor: '#32a852',
        confirmButtonText: `Ok`
      }).then((result)=>{
          if(result.isConfirmed){
            $.ajax({
                url:"/added-to-cart?id="+proId,
                method:"get",
                success:(response)=>{
                          if(response.status){
                            location.reload()

                                    
                          }
                         
                }
      })
          }
      })
                  
          
}

function addToWish(proId){
    $.ajax({
        url:'/added-to-wishList?id='+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                Swal.fire({
                    title: 'Item added to WishLIst',
                    icon: 'success',
                    iconColor:'#32a852',
                    showCancelButton: false,
                    confirmButtonColor: '#11ba25',
                    confirmButtonText: `Ok`
                  }).then((result)=>{
                   
                    if(result.isConfirmed){

                        location.reload()
                    }
                  })
            }
        }
    })

   
          
           
            
          
      
   
}
function removeWishProduct(wishId,proId){
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't to remove the Product",
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result)=>{
          if(result.isConfirmed){
              
              $.ajax({
                  url:'/remove-wishProduct',
                  data:{
                      wish:wishId,
                      product:proId
                  },
                  method:'post',
                  success:(response)=>{
                    location.reload()
                      if(response.removeProduct){
                          location.reload()
                      }
                  }
              })
          }
      })
}
function removeWish(proId){
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't to remove the Product",
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result)=>{
          if(result.isConfirmed){
             
              $.ajax({
                  url:'/remove-wish',
                  data:{
                     
                      product:proId
                  },
                  method:'post',
                  success:(response)=>{
                    location.reload()
                      if(response.removeProduct){
                          location.reload()
                      }
                  }
              })
          }
      })
}


function changeQuantity(cartId,proId,userId,count){
          let quantity=parseInt(document.getElementById(proId).innerHTML)
          count=parseInt(count)
          $.ajax({
              url:'/change-product-quantity',
              data:{
                  user:userId,
                  cart:cartId,
                  product:proId,
                  count:count,
                  quantity:quantity
              },
              method:'post',
              success:(response)=>{
                  if(response.removeProduct){
                  
                  location.reload()
                  }else{
                      document.getElementById(proId).innerHTML=quantity+count
                      
                      document.getElementById('total').innerHTML=response.total
                      document.getElementById('totala').innerHTML=response.total

                  }
              }
          })
      }

      function removeProduct(cartId,proId){
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't to remove the Product",
            icon: 'warning',
            iconColor:'#bf0f0f',
            showCancelButton: true,
            confirmButtonColor: '#11ba25',
            cancelButtonColor: '#bf0f0f',
            confirmButtonText: `Yes`
          }).then((result)=>{
              if(result.isConfirmed){

                $.ajax({
                    url:'/remove-cart-product',
                    data:{
                        cart:cartId,
                        product:proId
                    },
                    method:'post',
                    success:(response)=>{
                        if(response.removeProduct){
                            
                            location.reload()
                        }
                    }
                })
              }
          })

         
      }

      $("#checkout-form").submit((e)=>{
         
        e.preventDefault()
        $.ajax({
                  url:'/place-order',
                  method:'post',
                  data:$('#checkout-form').serialize(),
                  success:(response)=>{
                            
                            if(response.codSuccess){
                                
                                location.href='/order-success'
                            }else if(response.razorpaySuccess){
                                
                                rozorpayPayment(response)
                            }else if(response){
                                location.href=response.url
                            }
                  }
        })
})

function rozorpayPayment(order){
   
    var options = {
        "key": "rzp_test_sRomirPdgXvtzH", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "SHOPSY",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id":order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            
            verifyPayment(response,order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();

}

function verifyPayment(payment,order){
    
$.ajax({ 
    url:'/verify-payment',
    data:{
        payment,
        order
    },
    method:'post',
    success:(response)=>{
       
        if(response.status){
            location.href='/order-success'
        }else{
            alert('payment failed')
        }
    }
})
}

function removeOrder(orderId,userId,paymentMethod,totalAmount){
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Cancel! this Order",
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result)=>{
        if(result.isConfirmed){
            $.ajax({
                url:'/remove-order',
                data:{
                    order:orderId,
                    user:userId,
                    paymentMethod:paymentMethod,
                    totalAmount:totalAmount,
                },
                method:'post',
                success:(response)=>{
                    if(response.refund){
                        Swal.fire({
                            title: 'Amount Creadeted to your account',
                            icon: 'success',
                            iconColor:'#32a852',
                            showCancelButton: false,
                            confirmButtonColor: '#11ba25',
                            confirmButtonText: `Ok`
                          }).then((result)=>{
                              if(result.isConfirmed){
                                location.reload()
                              }
                          })
                        
                    }else{
                        location.reload()
                    }
                }
            })
        }
      })
}
function deleteAddress(addId){
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Delete! this Address",
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result)=>{
          if(result.isConfirmed){
            $.ajax({
                url:'/delete-address',
                data:{
                    addId:addId
                },
                method:'post',
                success:(response)=>{
                    if(response){
                        
                        location.reload()
                    }
                }
            })
          }
      })
}


