
<h3 align="center"></h3>
<p align="center">
    <img alt="iCon" src="./icon.png" width="256px">
</p>
<h1 align="center">Oculus Dummy</h1>

<h3 align="center">The Oculus Client uses more resources than it should, and that's dumb.</h3>

<br>

## Reasons to use Oculus Dummy

- When you use Link, the Oculus Client opens whether you like it or not, this makes it almost not exist, running as a tray application in the background.

- The Oculus Client runs on Electron, meaning _**ALL**_ UI uses system resources, even if it's the 1000th time you've opened a page.

- The Oculus Client uses system resources that could be use for more important things:
    - It uses your GPU for a bit on startup.
        - This is more of a nitpick than anything impactful if I'll be honest, especially if you're on a laptop and have it set to use your iGPU.
    - Sometimes it randomly decides to uses your CPU.
        - This is just stupid, especially if you're playing a CPU intensive game like BaS or Boneworks.
    - It can use an average of 200mb of memory, even in the damn settings menu.
        - Personally, I've seen it use as low as 158mb, up to 267mb of memory.
- Oculus Dummy loads faster, doesn't use any notable CPU or GPU power, and uses less than 20mb of memory.

## Installation

1. Go to `C:\Program Files\Oculus\Support\oculus-client\resources` in your File Explorer.

2. Rename `app.asar` to something else, preferably `app.asar.bak` though it doesn't matter.

3. Download this and move it to the same folder.

4. Enjoy the extra bit of performance!

## Building from source (Windows Only)

1. Clone the repo

2. Run `pnpm i` or `npm i`

3. Run `pnpm build` or `npm run build` 

4. The result should be in the `dist` folder, no extra stuff in needed if you want to install it

