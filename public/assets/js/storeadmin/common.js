jQuery(document).on("change", "#getOrderByType", function() {
  jQuery.get(baseUrl + "/getOrder/" + jQuery(this).val(), function(data) {
    jQuery("#display-most-row").html("");
    if (data.length > 0) {
      data.forEach(e => {
        jQuery("#display-most-row").append(
          "<tr><td class='avatar'><div class='round-img'><a href='#'>" +
            "<img class='rounded-circle'src='" +
            e.productimg +
            "' alt=''/></a>" +
            "</div> </td><td>" +
            e.name +
            "</td><td><span class='count'>" +
            e.price +
            "</span></td>" +
            "<td>" +
            e.category.title +
            "</td></tr>"
        );
      });
    }
  });
});

jQuery(document).on("change", "#getOrderReportByType", function() {
  jQuery.get(baseUrl + "/getOrderReporting/" + jQuery(this).val(), function(
    data
  ) {
    jQuery("#display-order-repoty-row").html("");
    jQuery("#revanueTotl").text(0);
    if (data.orders.length > 0) {
      jQuery("#revanueTotl").text(data.totalRevanue[0].total);
      data.orders.forEach(e => {
        jQuery("#display-order-repoty-row").append(
          "<tr><td class='avatar'><div class='round-img'><a href='#'>" +
            "<img class='rounded-circle'src='" +
            e.product.productimg +
            "'/></a></div></td>" +
            "<td>" +
            e.product.name +
            "</td>" +
            "<td>" +
            e.user.firstname +
            " " +
            e.user.firstname +
            "</td>" +
            "<td>" +
            e.user.email +
            "</td>" +
            "<td><span class='text-success'><i class='fa fa-money'></i> " +
            e.paymentMethod +
            "</span></td>" +
            "<td><span class='count'>" +
            e.price +
            "</span></td>" +
            "</tr>"
        );
      });
    }
  });
});
