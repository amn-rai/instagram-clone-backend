console.log(" i runnig");

jQuery(document).on("change", "#catagories", function() {
  jQuery.get("/subcategories/" + jQuery(this).val(), function(
    data
  ) {
    console.log("data",data);
    
    if (data.success == 1 && data.subCategory.length > 0) {
      //   jQuery("#subcatagories").css("display", "block");
      jQuery("#subcatagories").html("");
      jQuery("#subcatagories").append("<option value=''>--select--</option>");
      data.subCategory.forEach(e => {
        jQuery("#subcatagories").append(
          "<option value='" + e._id + "'>" + e.title + "</option>"
        );
      });
    }
  });
});

