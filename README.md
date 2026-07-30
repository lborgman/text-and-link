<style>
  header h1 { display: none !important; }
</style>

# Clean Link
<a href="https://lborgman.github.io/text-and-link/text-and-link.html"
   onclick="
   (event) => {
      debugger;
      if (location.href == 'https://lborgman.github.io/text-and-link/text-and-link.html') {
         event.preventDefault();
         event.stopPropagation();
      }
   }
">This new test</a>
[This web page ](https://lborgman.github.io/text-and-link/text-and-link.html) can remove [click identifiers](Click_identifier) from a link.
Just enter the link that may contain click identifier and immediately get a cleaned link that you can copy.

## Share target

On some devices you can send links directly to this app from any other application on your device using your system's native share.  (Currently this only works well on __Android devices/mobiles__.)

1. __Install this web page__

   - This feature only works if the app is actively installed on your device.
   - Open this web page in your mobile browser (I have tested only in Chrome).
   - Tap your browser's menu (it looks like __⋮__) and select __Install and create shortcut__. (This may change with the Chrome web browser version.)

1. __Share Content From Other Apps__

   - Open any app (such as Twitter, YouTube, or your mobile browser).
   - Find something you want to share, and tap the native __Share icon__ (<img src="https://lborgman.github.io/text-and-link/share.svg" height="16" width="16" alt="Share icon" />)
   - Look through your device's popup share sheet menu. Tap the icon for this web page from the list of available apps:
<img src="https://lborgman.github.io/text-and-link/tl.svg" alt="Logo" width="26" height="26" xalign="left"
    style="vertical-align:text-top; margin-left:10px;" />

1. __What Happens Next__

   - This web page will automatically launch.
   - The shared link will instantly pre-fill, allowing you to copy immediately with the click identifiers removed.