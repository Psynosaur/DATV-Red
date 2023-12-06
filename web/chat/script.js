$(function()
{
  function viewers_cb_null() {};

  var chat = new BATC_Chat({
    element: $("#chat"),
    room: 'eshail-wb',
    nick: '',
    viewers_cb: viewers_cb_null,
    guests_allowed: true,
    focus_msgbox: true
  });
});