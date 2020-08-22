from notebook.utils import url_path_join
from ._version import __version__
from tornado import gen, web
from tornado.process import Subprocess, CalledProcessError
from notebook.base.handlers import APIHandler
from pathlib import Path
import subprocess, sys, os
import json


homedir = str(Path.home())+"/"

path_regex = r'(?P<path>(?:(?:/[^/]+)+|/?))'

def _jupyter_server_extension_paths():
    return [{
        'module': 'jupyterlab_converter'
    }]


@gen.coroutine
def run_command_async(cmd):
    """
    Run a command using the asynchronous `tornado.process.Subprocess`.
    Parameters
    ----------
    iterable
        An iterable of command-line arguments to run in the subprocess.
    Returns
    -------
    A tuple containing the (return code, stdout)
    """
    process = Subprocess(cmd,
                         stdout=Subprocess.STREAM,
                         stderr=Subprocess.STREAM)
    try:
        yield process.wait_for_exit()
    except CalledProcessError as err:
        pass
    code = process.returncode
    out = yield process.stdout.read_until_close()
    return (code, out.decode('utf-8'))


class ConvertHandler(APIHandler):
    """
    A handler that runs the file conversion
    """

    def initialize(self, notebook_dir):
        self.notebook_dir = notebook_dir

    @gen.coroutine
    def run_command(self, command_sequence):

        for cmd in command_sequence:
            code, output = yield run_command_async(cmd)
            if code != 0:
                self.set_status(500)
                self.log.error((f'command `{" ".join(cmd)}` '
                                 f'errored with code: {code}'))
                return output
        return "Succesfully run"

    @web.authenticated
    @gen.coroutine
    def post(self, *args, **kwargs):
        args = json.loads(self.request.body.decode('utf-8'))
        print(args)
        if args["format"] == 'ipynb':
            out = yield self.run_command([['sws2ipynb', homedir+args["path"] ]])
        else:
            out = yield self.run_command([['jupyter', 'nbconvert', '--to', args["format"], homedir+args["path"] ]])
        self.finish(json.dumps(args["path"] + " converted to {}.".format(args["format"])))



def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.
    Args:
        nb_server_app (NotebookApp): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    # Prepend the base_url so that it works in a jupyterhub setting
    base_url = web_app.settings['base_url']
    convert = url_path_join(base_url, 'convert')
    handlers = [(f'{convert}{path_regex}',
                 ConvertHandler,
                 {"notebook_dir": nb_server_app.notebook_dir}
                )]
    web_app.add_handlers('.*$', handlers)
