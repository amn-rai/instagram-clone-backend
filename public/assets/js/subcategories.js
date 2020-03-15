jQuery(document).ready(function(){
    jQuery("select.subcategoryshow").change(function(){
        // console.log("jQuery(this).val()",jQuery(this).val());
      var category = jQuery(this).children("option:selected").val();
      console.log(status);
      jQuery.ajax({
        type: "GET",
        url:  "/subcategories/"+category,
        success: function(data) {
        console.log("data",data);
        jQuery("#subcat").html("")
        data.subCategory.forEach((category ,i)=>{
      
            jQuery("#subcat").append(`<tr>
            <th scope="row">${i+1}</th>
            <td> ${category.title} </td>
            <td><i class="fa fa-edit ml-1 yess" aria-hidden="true" rel="${category._id }" title="${ category.title }" data-toggle="modal"
            data-target="#updatesubcategory" > </i> </td>
        <td><a href="/category/delete/${category._id}"><i class="fa fa-trash ml-1" aria-hidden="true" ></i> </td>
        
        </tr>`)
               }
             )
    }
});
});
});




