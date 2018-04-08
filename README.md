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


### NodosP (2018-03-28)

Estos nodos se agregaron en la nueva lista de nodos:

1: SIN      OCCIDENTAL SAN JUAN DEL RIO 03ARN-115                 Arancia
2: SIN        NOROESTE       HERMOSILLO 04ECC-400 Empalme Ciclo Combinado


Estos nodos estan en la DB pero NO en el archivo de nodos:

SAN JUAN DEL RIO	03ARA-115	Arancia
2: 04GYC-230 Guaymas Cerezo

(Esto es porque estaban en la version pasada de la lista de nodos pero no en la nueva (03-28-2018))

Cambios:

04ECC-230 -> 04ECC-400
03ARA-115 -> 03ARN-115


### BCS

BCS is complete! (All the nodes in the data appear in the db)

### BCA

The following nodes are in BCA but not in the nodeslist:

07DAR-69
07RZD-161
07SF2-115
07TJI-230

### SIN

The following nodes are in SIN but not in the nodeslist:

- `03ARN-115`
- `04ECC-400`


- `01KMC-85`
- `02BGB-115`
- `02CLX-115`
- `02THP-400`
- `02TMZ-69`
- `03B21-115`
- `03B24-115`
- `03J06-69`
- `03N06-115`
- `03P3M-115`
- `03S12-115`
- `04SSA-230`
- `05NAC-115`
- `05PH2-115`
- `06CUF-138`
- `06ILP-115`
- `06PTN-115`
- `02BEN-115`
- `02GEP-115`

Approach: Just remove everything from the data with those node ids. If we get the information later, add it later to the database.



## Other

`fecha,hora,node_id,pml,energia,perdidas,congestion`

- Los datos estan disponibles (para los 3 sistemas) a partir de abril de 2014
