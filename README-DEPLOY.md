# Despliegue en Google Cloud

Sitio estatico (HTML/CSS/JS) servido con nginx dentro de un contenedor y desplegado en **Cloud Run**.

## Archivos agregados

| Archivo | Funcion |
| --- | --- |
| `Dockerfile` | Construye la imagen con nginx y el sitio estatico. |
| `nginx/default.conf.template` | Configuracion de nginx; escucha en `$PORT`, comprime y define cache. |
| `cloudbuild.yaml` | Build + push a Artifact Registry + deploy a Cloud Run. |
| `.dockerignore` | Reduce el contexto de build. |
| `.gcloudignore` | Evita subir `.git` y archivos innecesarios a Cloud Build. |

## 1. Prerrequisitos

```bash
gcloud auth login
gcloud config set project TU_PROJECT_ID

# Habilitar APIs (una sola vez)
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

# Crear el repositorio de imagenes (una sola vez)
gcloud artifacts repositories create ja-web \
  --repository-format=docker \
  --location=us-east1 \
  --description="Imagenes Docker del sitio JA Carpet Services"
```

Permisos para la cuenta de servicio de Cloud Build (una sola vez). El numero de proyecto se obtiene con:

```bash
PROJECT_ID=TU_PROJECT_ID
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" --role="roles/run.admin" --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" --role="roles/artifactregistry.writer" --quiet

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${CB_SA}" --role="roles/iam.serviceAccountUser" --quiet
```

## 2. Probar localmente (opcional)

```bash
docker build -t ja-carpet-web .
docker run --rm -p 8080:8080 -e PORT=8080 ja-carpet-web
```

Abrir <http://localhost:8080>. El health check responde en `/healthz`.

## 3. Desplegar con Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml .
```

Al terminar, Cloud Build imprime la URL publica del servicio (`https://ja-carpet-web-....run.app`).

Los valores de servicio, region, repo, memoria, CPU e instancias maximas estan en el bloque `substitutions` de `cloudbuild.yaml`. Edita ese bloque si necesitas otros valores. Si prefieres sobreescribirlos por linea de comandos, pasa **todos** los valores:

```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_SERVICE=ja-carpet-web,_REGION=us-east1,_REPO=ja-web,_MEMORY=256Mi,_CPU=1,_MAX_INSTANCES=10 .
```

### Alternativa rapida (sin cloudbuild.yaml)

Cloud Run detecta el `Dockerfile` automaticamente:

```bash
gcloud run deploy ja-carpet-web \
  --source . \
  --region us-east1 \
  --allow-unauthenticated
```

## 4. Actualizar el sitio

```bash
git add .
git commit -m "Actualizacion del sitio"
gcloud builds submit --config cloudbuild.yaml .
```

## Notas

- Cloud Run inyecta `PORT`; nginx la lee en runtime, no hay que cambiar nada.
- `--min-instances=0` permite escalar a cero (costo minimo). La primera visita tras inactividad puede tardar ~1 s.
- Para un dominio propio: Cloud Run > **Custom domains** > mapear el dominio y crear los registros DNS indicados.
- `styles.css` referencia `img/carpet-bg.jpg`, que no existe en el repositorio. Genera un 404 al cargar el fondo de esa seccion; conviene agregar la imagen o cambiar la ruta.
- `Imagen_callcenter.png` pesa ~12 MB. Optimizarla (WebP/JPEG) mejora mucho la carga inicial, aunque no afecta el despliegue.
