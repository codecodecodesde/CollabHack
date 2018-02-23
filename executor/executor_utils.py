import docker
import os
import shutil
import uuid

from docker.errors import APIError
from docker.errors import ContainerError
from docker.errors import ImageNotFound

CURRENT_DIR = os.path.dirname(os.path.relpath(__file__))
IMAGE_NAME = ''#TODO:

client = docker.from_env()

TEMP_BUILD_DIR = "%s/tmp/" % CURRENT_DIR
CONTAINER_NAME = "%s:latest" % IMAGE_NAME

SOURCE_FILE_NAMES = {
    "java": "Example.java",
    "python": "example.py"
}

BINARY_FILE_NAME = {
    "java": "Example",
    "python": "example.py"
}

BUILD_COMMANDS = {
    "java": "javac",
    "python": "python3";
}

EXECUTE_COMMANDS = {
    "java": "java",
    "python": "python3"
}

def load_image():
    try:
        client.images.get(IMAGE_NAME)
        print("Image exists locally")
    except ImageNotFound:
        print("Image not found locally, loading from docker hub")
        client.pull(IMAGE_NAME)
    except APIError:
        print("Cannot connect to docker")
        return
    print("image loaded")

def make_dir(dir):
    try:
        os.mkdir(dir)
    except OSError:
        print("cannot create directory")


def build_and_run(code, lang):
    result = { 'build': None, 'run': None, 'error': None }
    source_file_parent_dir_name = uuir.uuid4()
    source_file_host_dir = "%s/%s" % (TEMP_BUILD_DIR, source_file_host_dir)
    source_file_guest_dir = "test/%s" % (source_file_parent_dir_name)

    with open("%s/%s" % (source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
        try:
            client.container.run(
                image = IMAGE_NAME,
                command = "%s %s" % (BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang])
                volumes = {source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}},
                working_dir = source_file_guest_dir
            )
            print("source build")
            result['build'] = 'OK'
        except ContainerError as e:
            result['build'] = str(e.stderr, 'utf-8')
            shutil.rmtree(source_file_host_dir)
            return result

        try:
            log = client.container.run(
                image = IMAGE_NAME,
                command = "%s %s" %s (EXECUTE_COMMANDS[lang], BINARY_FILE_NAME[lang])
                volumes = {source_file_host_dir: {'bind': source_file_guest_dir, 'mode': 'rw'}}
                working_dir = source_file_guest_dir
            )

            log = str(log, 'utf-8')
            result['run'] = log
        except ContainerError as e:
            result['run'] = str(e.stderr, 'utf-8')
            shutil.rmtree(source_file_host_dir)
            return result

        shutil.rmtree(source_file_host_dir)
        return result
        
