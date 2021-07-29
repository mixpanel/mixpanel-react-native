
import argparse
import subprocess


parser = argparse.ArgumentParser(description='Release Mixpanel React Native SDK')
parser.add_argument('--old', help='version for the release', action="store")
parser.add_argument('--new', help='version for the release', action="store")
args = parser.parse_args()

def bump_version():
    replace_version('package.json', "\"version\": \"" + args.old + "\"", "\"version\": \"" + args.new + "\"")
    replace_version('__tests__/index.test.js', "\"$lib_version\": \"" + args.old + "\"", "\"$lib_version\": \"" + args.new + "\"")
    subprocess.call('cd Samples/MixpanelDemo;yarn upgrade mixpanel-react-native --latest', shell=True)
    subprocess.call('cd Samples/SimpleMixpanel;yarn upgrade mixpanel-react-native --latest', shell=True)
    subprocess.call('cd Samples/ContextAPIMixpanel;yarn upgrade mixpanel-react-native --latest', shell=True)
    subprocess.call('git add package.json', shell=True)
    subprocess.call('git add __tests__/index.test.js', shell=True)
    subprocess.call('git add Samples/MixpanelDemo/yarn.lock', shell=True)
    subprocess.call('git add Samples/SimpleMixpanel/yarn.lock', shell=True)
    subprocess.call('git add Samples/ContextAPIMixpanel/yarn.lock', shell=True)
    subprocess.call('git commit -m "Version {}"'.format(args.new), shell=True)
    subprocess.call('git push', shell=True)

def replace_version(file_name, old_version, new_version):
    with open(file_name) as f:
        file_str = f.read()
        assert(old_version in file_str)
        file_str = file_str.replace(old_version, new_version)

    with open(file_name, "w") as f:
        f.write(file_str)

def generate_docs():
    subprocess.call('./generate_docs.sh', shell=True)
    subprocess.call('git add docs', shell=True)
    subprocess.call('git commit -m "Update docs"', shell=True)
    subprocess.call('git push', shell=True)

def add_tag():
    subprocess.call('git tag -a v{} -m "version {}"'.format(args.new, args.new), shell=True)
    subprocess.call('git push origin --tags', shell=True)

def main():
    bump_version()
    generate_docs()
    add_tag()
    print("Congratulations! " + args.new + " is now released!")

if __name__ == '__main__':
    main()
