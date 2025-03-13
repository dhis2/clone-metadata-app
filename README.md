# Clone Metadata app
> [!NOTE]
> The app is available in DHIS2 App hub

## Ovewview
The Clone Metadata App is designed to replicate a program or data set, along with its dependencies, into multiple copies within a DHIS2 instance. This tool is particularly useful for DHIS2 training, allowing each participant to receive a set of cloned metadata from a template program or dataset, as well as an account to access the training instance.

## Features
- Set the number of metadata copies to generate
- Add a unique prefix for each cloned metadata set
- Clone Dataset/Program dependencies
- Configure sharing settings for cloned metadata
- Automatically create a user account for each cloned metadata set

## Getting Started

### Running Locally (Development)
Refer to [Dhis2 Developer](https://developers.dhis2.org/docs/app-platform/scripts/start)
```sh
yarn start
```

### Building for Production
Refer to [Dhis2 Developer](https://developers.dhis2.org/docs/app-platform/scripts/build)
```sh
yarn build
```

## Usage Instructions  
For detailed instructions, refer to the [User Guide](https://docs.google.com/document/d/1ekLI6A2K428XzetPSLBhX4yknnf5BDic30DkBkkuGZ0).

## Technologies Used
- React
- d2-app-runtime
- d2-ui