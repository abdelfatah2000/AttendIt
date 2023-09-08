$('.menu > ul > li').click(function (e) {
  $(this).siblings().removeClass('active');
  //addactive to clicked
  $(this).toggleClass('active');
  // if has sub-menu open it
  $(this).find('ul').slideToggle();
  // close any sub-menu if one is opened
  $(this).siblings().find('ul').slideUp();
  // remove active class of sub-menu items
  $(this).siblings().find('ul').find('li').removeClass('active');
});
