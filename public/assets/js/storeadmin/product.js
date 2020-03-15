jQuery(document).on("change", "#catagories", function() {
  jQuery.get(baseUrl + "/product/sub-cat?catId=" + jQuery(this).val(), function(
    data
  ) {
    if (data.sucess == 1 && data.subCatagory.length > 0) {
      //   jQuery("#subcatagories").css("display", "block");
      jQuery("#subcatagories").html("");
      jQuery("#subcatagories").append("<option value=''>--select--</option>");
      data.subCatagory.forEach(e => {
        jQuery("#subcatagories").append(
          "<option value='" + e._id + "'>" + e.title + "</option>"
        );
      });
    }
  });
});
