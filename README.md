# fileconvert

Menu to convert files to other formats


## Prerequisites

* JupyterLab
* To have a `sws2ipynb` program in the path, that performs the sws to ipynb conversion.

## Installation

```bash
jupyter labextension install fileconvert
pip3 install .
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

