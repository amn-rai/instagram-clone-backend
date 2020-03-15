jQuery(document).ready(function(){
    jQuery("select.status").change(function(){
        console.log("jQuery(this).val()",jQuery(this).val());
        let obj = jQuery(this)
        var status = jQuery(this).children("option:selected").val();
      console.log(status);
      jQuery.ajax({
        type: "PUT",
        url:  "/orders/changestatus/" + jQuery(this).attr("rel"),
        data: { status: parseInt(status) },
        success: function(data) {
        console.log("data",data);
        if(data.sucess==1 && status ==5){
          jQuery(obj).parent().html(`<span class="badge badge-success">Completed</span>
          `)
        }
        
        }
      });
    });
});

