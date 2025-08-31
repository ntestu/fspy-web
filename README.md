# fspy-web

This is a fork of [fSpy](https://github.com/stuffmatic/fSpy) porting it to a web application so that it can be used directly from a browser.

fSpy is an open source app for still image camera matching. See [fspy.io](https://fspy.io) for more info. The source code is available under the GPL license.

![fSpy screenshot](screenshot.jpg)

## Using the computed camera parameters in other applications

In theory, camera parameters computed by fSpy could be used in any application that has a notion of a 3D camera and provides some way of setting the camera parameters. If you're a Blender user, have a look at the [offical fSpy importer add-on](https://github.com/stuffmatic/fSpy-Blender). If you're using an application without a dedicated importer, you may still be able to manually copy the camera parameters from fSpy.

Interested in writing an importer for your favorite application? Then the [fSpy project file format spec](https://github.com/stuffmatic/fSpy/blob/develop/project_file_format.md) is a good starting point.


## Building and running

<!-- TODO(ntestu): url -->
The following instructions are for developers. If you just want to use the app, head to the web application or [download the latest executable for your platform](https://github.com/stuffmatic/fSpy/releases).

fspy-web is written in [Typescript](https://www.typescriptlang.org) using [Vite](https://vite.dev), [React](https://reactjs.org) and [Redux](https://redux.js.org). [Visual Studio Code](https://code.visualstudio.com) is recommended for a pleasant editing experience.

Useful commands are:
- `pnpm install`: install necessary dependencies
- `pnpm start`: run the app in development mode
- `pnpm build`: build the app for production
- `pnpm preview`: locally preview the built production app
- `pnpm run deploy`: build and deploy to GitHub Pages (by committing the built app on branch `gh-pages`)

Note that this fork aims to make as few changes as possible to files from the base repo in order to minimize potential merge conflicts.
This comes at the cost of some parts of the code being less idiomatic, e.g. anything mentioning Electron despite the project not depending on Electron anymore.


## Notes

This fork was created using `pnpx degit reduxjs/redux-templates/packages/vite-template-redux`.

## Known issues

- Pressing shift in a certain why while moving a point may cause it to become stuck
- Saving a project doesn't remove "(modified)" from the page title
- Anything near a `TODO(ntestu)` label in the code is incomplete
