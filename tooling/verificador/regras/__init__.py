from .base import Resultado
from .sch01_banda_valida import SCH01_BandaValida
from .sch02_subclasse_valida import SCH02_SubclasseValida
from .sch03_capitulos_sequenciais import SCH03_CapitulosSequenciais
from .sch04_catalogo_nao_vazio import SCH04_CatalogoNaoVazio
from .sch05_variante_bem_formada import SCH05_VarianteBemFormada
from .sch06_predicado_circular import SCH06_PredicadoCircular
from .t01_ids_unicos import T01_IdsUnicos
from .t02_sem_escrita_sistema import T02_SemEscritaSistema
from .t03_tipos_validos import T03_TiposValidos
from .t04_profundidade_predicado import T04_ProfundidadePredicado
from .t05_variante_fallback import T05_VarianteFallback
from .t07_reconhecimento import T07_Reconhecimento
from .t08_leitura_escrita import T08_LeituraEscrita
from .t14_ascii_minusculo import T14_AsciiMinusculo
from .t18_camada_neutra import T18_CamadaNeutra
from .t19_dominio_arco_tom import T19_DominioArcoTom
from .t21_fechamento_complicacao import T21_FechamentoComplicacao

# Ordem: sanidade de esquema primeiro (falhas aqui tornam T-xx pouco confiáveis),
# depois regras ESPEC §7.2 na ordem numérica.
REGRAS = [
    SCH04_CatalogoNaoVazio(),
    SCH01_BandaValida(),
    SCH02_SubclasseValida(),
    SCH03_CapitulosSequenciais(),
    SCH05_VarianteBemFormada(),
    SCH06_PredicadoCircular(),
    T01_IdsUnicos(),
    T02_SemEscritaSistema(),
    T03_TiposValidos(),
    T04_ProfundidadePredicado(),
    T05_VarianteFallback(),
    T07_Reconhecimento(),
    T08_LeituraEscrita(),
    T14_AsciiMinusculo(),
    T18_CamadaNeutra(),
    T19_DominioArcoTom(),
    T21_FechamentoComplicacao(),
]

__all__ = ["Resultado", "REGRAS"]
