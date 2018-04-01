# CENACE Outlook

Outlook of the day in Day Ahead Marked (DAM) demand for Mexico National Electric System.

## Setup

```
$ yarn install
```

## Configuration

You must configure the base URL for the data server. This is an environment variable that you must set in a `.env` file in the root directory. 

An example has been provided in `example.env`

```
$ cp env.example .env
```

Then edit the `.env` file with the correct server url.

That's it!

```
$ yarn run
```

## Reading in data:

The following nodes are in BCA but not in the nodeslist:

- `07AUE-115`
- `07SKW-161`


The following nodes are in SIN but not in the nodeslist:

- `03ARN-115`
- `03IGC-115`
- `04ECC-400`
- `05TSM-115`


`fecha,hora,node_id,pml,energia,perdidas,congestion`

- Los datos estan disponibles (para los 3 sistemas) a partir de abril de 2014
