# fileconvert

Menu to convert files to other formats


## Prerequisites

* JupyterLab
* To have a `sws2ipynb` program in the path, that performs the sws to ipynb conversion.



## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
jlpm
jlpm run build
jupyter-labextension install .
```

the backend part is installed nand enabled with

```bash
pip3 install .
jupyter serverextension enable --py jupyterlab_converter
```
