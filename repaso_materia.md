## Razonamiento y planificación automática

# SEMANA 08: SEMANA DE REPASO

Adriana Cervantes Castillo

```
Universidad Internacional de La Rioja
```

# Contenido

- Repaso general


# Tema 1:Toma de decisiones

- 1.
- Cuando una situación necesita ser analizada y una decisión tomada, es necesario
    asumir un riesgo; por tanto, es necesario evaluar e identificar el riesgo
    involucrado y decidir cuáles son las medidas a adoptar para que este sea mínimo.
    La capacidad que tenemos para tomar decisiones está relacionada con la
    asunción de riesgo, la creatividad y la búsqueda de alternativas a los retos que
    aún no existen.
Es posible clasificar las decisiones en dos tipos: decisiones programadas y decisiones
no programadas.
- Las decisiones programadas son de rutina y se repiten periódicamente. Tienen
    que ver con problemas bien definidos y no requieren un proceso de decisión
    complejo.
- Las decisiones no programadas están relacionadas con condiciones o entornos
    desconocidos, situaciones nuevas y no existen reglas o métodos establecidos que
    puedan servir como guía.


#### Etapas necesarias para la resolución de problemas

- Primera etapa
    - Comprender la complejidad del problema es el objetivo de esta etapa.
    - La información es primordial en la toma de decisiones: a mayor calidad de
       esta, mejor es la calidad de la toma de decisiones.
- 1.
- Agentes basados en búsquedas y planificación. Estos agentes resuelven el
    problema de alcanzar una meta u objetivo deseado en el entorno en el que se
    encuentran por medio de la exploración del espacio de estados


(Wooldridge, 1994) proponen, una clasificación de arquitectura de agentes en tres
categorías principales:

- Arquitecturas deliberativas.
- Arquitecturas reactivas.
- Arquitecturas híbridas



- Existen varias técnicas para dar explicación a los problemas:

#### clasificación ERIM de problemas, método de los seis interrogantes,

#### las veinte causas, diagrama de espina de pez y mapas mentales.


# Tema 2. Representación del conocimiento

# y razonamiento

- 2.


- Para resolver problemas de modo natural es necesario llevar a cabo un análisis
    preciso del conocimiento.

2.4.

- En todo razonamiento existen dos elementos: contenido y forma
- El razonamiento puede clasificarse en: razonamiento deductivo y razonamiento
    no deductivo
- Un razonamiento inválido se produce cuando, a partir de premisas verdaderas,
    se obtiene una conclusión falsa.

2.

- El método inductivo fue propuesto por Francis Bacon para tratar de generalizar
    conclusiones de carácter universal a partir de la observación de casos
    particulares. El método inductivo tiene riqueza de información.
- La diferencia con el razonamiento deductivo es que la conclusión no se obtiene
    obligatoriamente de las premisas. La conclusión del razonamiento inductivo se
    obtiene con la observación directa de casos particulares.


# Tema 3. Tipos de lógica

- 3.2. La definición que podemos encontrar en el Diccionario de la lengua
    española para la palabra lógica es la siguiente: «Ciencia que expone las leyes,
    modos y formas de las proposiciones en relación con su verdad o falsedad».
- Lógica proposicional: se utilizan proposiciones que representan afirmaciones que
    pueden ser verdaderas o falsas.
- El filósofo griego Aristóteleses considerado el padre de la lógica, ya que fue el
    primero en mostrar interés por el razonamiento lógico y emplear sistemas de
    validación de argumentos como indicadores de verdad, utilizando el silogismo
    (razonamiento que está formado por dos premisas y una conclusión que es el
    resultado lógico que se deduce de estas) como argumento válido y desarrollando
    un sistema lógico que ha llegado a nuestros días.
-.


- 3.3Una proposición es toda afirmación o expresión que tiene significado

#### y de la que podemos decir si es «falsa» (F/0) o «verdadera» (V/1).

- 3.4Las lógicas descriptivas son apropiadas para la web semántica porque

#### son útiles para agregar razonamiento a la red de redes

- 3.6. La lógica multivaluada es una lógica que permite valores

#### intermedios (grande, tibio, lejos, pocos, muchos, etc.) y en la que se

#### emplean más de dos valores de verdad para describir conceptos que van

#### más allá de lo verdadero y lo falso. Las lógicas multivaluadas ofrecen

#### herramientas conceptuales que hacen posible describir formalmente la

#### información difusa, vaga o incierta.


# Tema 4. Problemas de búsqueda

- En Inteligencia Artificial, una función heurística se define como una estimación
    de lo que falta para conseguir el objetivo.
- Búsqueda no informada: Decimos que una búsqueda es no informada cuando no
    emplea ningún tipo de heurística (el término heurística lo explicaremos en más
    adelante con más detalle). Es decir, no tienen ningún modo de poder guiar la
    búsqueda, siempre se evalúa el siguiente estado sin conocer a priori si este es
    mejor o peor que el anterior.
- Búsqueda informada: representa aquellos algoritmos que emplean una función
    heurística para guiar la búsqueda y de esta manera llegar a soluciones óptimas
    del problema.


- La búsqueda en amplitud (BFS, por sus siglas en inglés) es una estrategia que
    genera el árbol de búsqueda por niveles de profundidad, expandiendo todos los
    nodos de nivel i antes de expandir los nodos de nivel i+1.


- La búsqueda en profundidad (DFS, por sus siglas en inglés) es otra estrategia de
    búsqueda no informada (sin información adicional). En ella, al contrario de la
    búsqueda en amplitud, se intenta desarrollar un camino de longitud
    indeterminada, en el cual intentamos alcanzar metas profundas (aquellas que
    tienen un camino largo para alcanzarlas) desarrollando las menores
    ramificaciones posibles.


# Tema 5. Búsqueda informada

- La función heurística es dependiente del estado y se usa para evaluar cómo de
    prometedor es un nodo.
- Algoritmos que usan búsqueda informada
    - Algoritmo A*
    - Búsqueda por sub-objetivos
    - Búsqueda online
       - hillclimbing


# Tema 6. Búsqueda entre adversarios

- Algoritmos usados
    - Minimax
    - Poda alfa-beta
    - Expectiminimax
    - Los problemas entre adversarios son aquellos en los que más de un agente
       especializado actúa de modo concurrente en un mismo entorno
    - Minimaxes un método de decisión para minimizar la pérdida máxima
       esperada en juegos con adversario y con información perfecta.
    - Con poda alfa-beta existe la posibilidad de tomar una decisión minimax
       correcta sin tener que mirar todos los nodos en el árbol.


# Rema 7: Problemas de planificación

- La planificación automática en inteligencia artificial apunta a secuencias
    ordenadas de acciones que alcanzan objetivos específicos, que definimos como
    planes.
- Se define planificación como el proceso formalizado de búsqueda de secuencias
    de acciones que partiendo del estado actual del entorno satisfacen una meta.
    (Russell, 2004)
- La planificación es una tarea compleja y por esta razón la mayoría de los
    planificadores trabajan sobre un modelo restringido del entorno (planificación
    clásica). Este modelo es determinista, estático y totalmente observable.
- Acción. es un paso simple y atómico dentro de un plan que hace que un agente
    haga algo (ir a un punto, activar un objeto, etc.)


- Proceso de planificación: Un agente proporciona a un sistema (planificador) un
    estado actual del entorno, un conjunto de acciones y una meta que desea
    satisfacer, y el planificador busca un plan que con la ejecución de sus acciones
    consiga esta meta.
- La planificación es una tarea compleja y por esta razón la mayoría de los
    planificadores trabajan sobre un modelo restringido del entorno (planificación
    clásica). Este modelo es determinista, estático y totalmente observable.
- plan parcialmente ordenado (partialorderplan, POP) se define como un plan en
    el que solo se especifican algunas de las precedencias entre sus acciones.


- un algoritmo POP simplemente emplea un algoritmo de búsqueda (en
    profundidad, por ejemplo) en el espacio de los planes parciales para encontrar el
    plan parcial final.


# Tema 8: Sistemas basados en STRIPS

- La heurística STRIPS consiste en encontrar los planes parciales para alcanzar cada
    una de las proposiciones que se encuentran en el estado objetivo o meta
- PDDL: Se basa en una descripción de los componentes de un planificador en dos
    conjuntos: uno de definición del dominio y otro de definición del problema.


# Tema 9: Redes de tareas Jerárquicas

# (HTN)

- Una red de tareas representa una jerarquía de tareas, cada una de las cuales
    puede ejecutarse, si la tarea es primitiva, o ser descompuesta en subtareas
    refinadas.
- En una red de tareas, el proceso de planificación comienza descomponiendo la
    red de tarea inicial y continúa hasta que se descompongan todas las tareas
    compuestas, es decir, se encuentre una solución
- HTN es adecuado para dominios donde las tareas se organizan naturalmente en
    una jerarquía.


- En una HTN cuando definamos las tareas, tendremos que establecer dos
    elementos principales: las precondiciones necesarias que deben darse en el
    entorno para poder ejecutar una tarea y los efectos que se crean en el entorno.


# Tema 11. Planificación por múltiples

# agentes

- Uno de los mayores retos para implementar una planificación multi agente es el
    desarrollo de los protocolos de comunicación entre los agentes.
- FMAP
- FMAP es un planificador multi agente que utiliza un POP y un algoritmo de
    búsqueda A* multi agente. Implementa una planificación hacia adelante
    (Forward). El algoritmo general de FMAP se divide en tres fases:
- 1. Intercambio de información entre los agentes
- 2. Refinamiento individual
- 3. Proceso de coordinación


- FMAP no utiliza un proceso de control por medio de mensajes broadcast. Por el
    contrario, mantiene un liderazgo democrático en el cual un rol de coordinador es
    planificado entre los agentes. Es decir, un agente en cualquier momento adopta
    el rol de coordinador en cada iteración, permitiéndole liderar el procedimiento
    de refinamiento. Inicialmente, el coordinador se elige de manera aleatoria.