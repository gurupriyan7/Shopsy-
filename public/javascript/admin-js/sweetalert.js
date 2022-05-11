function userUnblock (event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          
             
          
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Unblock!"+" "+name,
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result) => {
        if (result.isConfirmed) {
            window.location=link;
        }else{
          return false;
        }
      })
        }
function userBlock (event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          
             
          
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Block!"+" "+name,
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result) => {
        if (result.isConfirmed) {
            window.location=link;
        }else{
          return false;
        }
      })
        }
function deleteProduct(event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          
             
          
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Delete!"+" "+name,
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result) => {
        if (result.isConfirmed) {
            window.location=link;
        }else{
          return false;
        }
      })
        }
function editProduct(event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          
             
          
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Edit!"+" "+name,
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result) => {
        if (result.isConfirmed) {
            window.location=link;
        }else{
          return false;
        }
      })
        }
function editCatagory(event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          
             
          
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Edit!"+" "+name+""+"Catagory",
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result) => {
        if (result.isConfirmed) {
            window.location=link;
        }else{
          return false;
        }
      })
        }
function deleteCatagory(event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          
             
          
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Delete!"+" "+name+" "+"Catagory",
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result) => {
        if (result.isConfirmed) {
            window.location=link;
        }else{
          return false;
        }
      })
        }
        function deleteProOffer(event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          Swal.fire({
            title: 'Are you sure?',
            text: "You won't to Delete!"+" "+name+" "+"offer",
            icon: 'warning',
            iconColor:'#bf0f0f',
            showCancelButton: true,
            confirmButtonColor: '#11ba25',
            cancelButtonColor: '#bf0f0f',
            confirmButtonText: `Yes`
          }).then((result)=>{
            if(result.isConfirmed){
              window.location=link;
            }else{
              return false;
            }
          })
        }
        function deleteCatOffer(event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          Swal.fire({
            title: 'Are you sure?',
            text: "You won't to Delete!"+" "+name+" "+"offer",
            icon: 'warning',
            iconColor:'#bf0f0f',
            showCancelButton: true,
            confirmButtonColor: '#11ba25',
            cancelButtonColor: '#bf0f0f',
            confirmButtonText: `Yes`
          }).then((result)=>{
            if(result.isConfirmed){
              window.location=link;
            }else{
              return false;
            }
          })
        }

        function deleteBanner(event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          
             
          
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Delete!"+" "+name,
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result) => {
        if (result.isConfirmed) {
            window.location=link;
        }else{
          return false;
        }
      })
        }

        function deleteCoupon(event){
          var link=event.currentTarget.href;
          var name=event.currentTarget.name;
          event.preventDefault();
          
             
          
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't to Delete!"+" "+name,
        icon: 'warning',
        iconColor:'#bf0f0f',
        showCancelButton: true,
        confirmButtonColor: '#11ba25',
        cancelButtonColor: '#bf0f0f',
        confirmButtonText: `Yes`
      }).then((result) => {
        if (result.isConfirmed) {
            window.location=link;
        }else{
          return false;
        }
      })
        }