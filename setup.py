"""
Setup module for the jupyterlab-converter
"""
import setuptools



setuptools.setup(
    name='jupyterlab_converter',
    version='0.1.1',
    author='Miguel Marco',
    description="A server extension for JupyterLab's converter extension",
    packages=setuptools.find_packages(),
    install_requires=[
        'notebook',
    ],
    package_data={'jupyterlab_converter': ['*']},
)
