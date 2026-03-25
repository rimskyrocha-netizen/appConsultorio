import React, { useState, useMemo, useEffect } from 'react';
import { Procedure, ProcedureCategory } from '../types';

const INITIAL_PROCEDURES: Procedure[] = [
  // --- PREVENÇÃO E DIAGNÓSTICO ---
  { id: '1', name: 'Avaliação Clínica Completa', description: 'Exame clínico detalhado, anamnese e plano de tratamento.', category: ProcedureCategory.EXAME, defaultValue: 100.00, estimatedMinutes: 30 },
  { id: '2', name: 'Profilaxia e Jato de Bicarbonato', description: 'Limpeza profissional, remoção de placa e manchas superficiais.', category: ProcedureCategory.PREVENCAO, defaultValue: 180.00, estimatedMinutes: 40 },
  { id: '3', name: 'Aplicação Tópica de Flúor', description: 'Prevenção de cáries e dessensibilização.', category: ProcedureCategory.PREVENCAO, defaultValue: 80.00, estimatedMinutes: 15 },
  { id: '4', name: 'Aplicação de Selante (por dente)', description: 'Proteção de fóssulas e fissuras em dentes posteriores.', category: ProcedureCategory.PREVENCAO, defaultValue: 90.00, estimatedMinutes: 20 },
  { id: '5', name: 'Radiografia Periapical', description: 'Exame radiográfico intraoral unitário.', category: ProcedureCategory.EXAME, defaultValue: 40.00, estimatedMinutes: 10 },

  // --- DENTÍSTICA / ESTÉTICA ---
  { id: '6', name: 'Restauração de Resina 1 Face', description: 'Restauração estética simples em resina composta.', category: ProcedureCategory.ESTETICA, defaultValue: 220.00, estimatedMinutes: 30 },
  { id: '7', name: 'Restauração de Resina 2 Faces', description: 'Restauração estética complexa envolvendo duas superfícies.', category: ProcedureCategory.ESTETICA, defaultValue: 280.00, estimatedMinutes: 45 },
  { id: '8', name: 'Restauração de Resina 3 Faces', description: 'Restauração de grande porte em resina composta.', category: ProcedureCategory.ESTETICA, defaultValue: 350.00, estimatedMinutes: 60 },
  { id: '9', name: 'Clareamento Dental Caseiro', description: 'Kit de clareamento com moldeiras personalizadas e gel.', category: ProcedureCategory.ESTETICA, defaultValue: 650.00, estimatedMinutes: 30 },
  { id: '10', name: 'Clareamento Dental de Consultório', description: 'Sessão de clareamento com gel de alta concentração.', category: ProcedureCategory.ESTETICA, defaultValue: 900.00, estimatedMinutes: 90 },
  { id: '11', name: 'Faceta em Resina Direta', description: 'Recobrimento estético da face vestibular do dente.', category: ProcedureCategory.ESTETICA, defaultValue: 450.00, estimatedMinutes: 90 },
  { id: '12', name: 'Lente de Contato Dental (Porcelana)', description: 'Lâmina ultrafina de cerâmica para correção estética.', category: ProcedureCategory.ESTETICA, defaultValue: 1800.00, estimatedMinutes: 120 },

  // --- ENDODONTIA ---
  { id: '13', name: 'Canal - Dente Incisivo/Canino', description: 'Tratamento endodôntico em dente unirradicular.', category: ProcedureCategory.ENDODONTIA, defaultValue: 550.00, estimatedMinutes: 60 },
  { id: '14', name: 'Canal - Dente Pré-Molar', description: 'Tratamento endodôntico em dente birradicular.', category: ProcedureCategory.ENDODONTIA, defaultValue: 700.00, estimatedMinutes: 90 },
  { id: '15', name: 'Canal - Dente Molar', description: 'Tratamento endodôntico multirradicular complexo.', category: ProcedureCategory.ENDODONTIA, defaultValue: 950.00, estimatedMinutes: 120 },

  // --- CIRURGIA ---
  { id: '18', name: 'Exodontia Simples', description: 'Remoção de dente permanente erupcionado.', category: ProcedureCategory.CIRURGIA, defaultValue: 250.00, estimatedMinutes: 45 },
  { id: '19', name: 'Exodontia de Siso (Incluso)', description: 'Cirurgia para remoção de terceiro molar não erupcionado.', category: ProcedureCategory.CIRURGIA, defaultValue: 600.00, estimatedMinutes: 90 },

  // --- PROCEDIMENTOS DO PDF (CATEGORIA IMPLANTE) ---
  { id: '81000065', name: 'Consulta odontológica inicial', description: 'Consulta destinada à elaboração do plano de tratamento.', category: ProcedureCategory.IMPLANTE, defaultValue: 50.82, estimatedMinutes: 30 },
  { id: '81000030', name: 'Consulta odontológica', description: 'Solicitada quando não for executado nenhum procedimento e a consulta não se enquadre como de urgência ou inicial.', category: ProcedureCategory.IMPLANTE, defaultValue: 54.30, estimatedMinutes: 30 },
  { id: '81000049', name: 'Consulta odontológica de Urgência', description: 'Código que deverá ser utilizado pelos credenciados.', category: ProcedureCategory.IMPLANTE, defaultValue: 80.85, estimatedMinutes: 30 },
  { id: '81000057', name: 'Consulta odontológica de Urgência 24hs', description: 'EXCLUSIVAMENTE na especialidade 611.', category: ProcedureCategory.IMPLANTE, defaultValue: 122.56, estimatedMinutes: 30 },
  { id: '81000235', name: 'Diagnóstico e tratamento de xerostomia', description: 'Diagnóstico e tratamento de secura bucal.', category: ProcedureCategory.IMPLANTE, defaultValue: 70.83, estimatedMinutes: 30 },
  { id: '82000026', name: 'Acompanhamento de tratamento /procedimento cirúrgico em odontologia', description: 'Acompanhamento de tratamento realizado em ambulatório.', category: ProcedureCategory.IMPLANTE, defaultValue: 50.82, estimatedMinutes: 20 },
  { id: '82000506', name: 'Controle pós-operatório em odontologia', description: 'Realização de consulta em ambiente hospitalar pós-cirúrgico.', category: ProcedureCategory.IMPLANTE, defaultValue: 60.67, estimatedMinutes: 30 },
  { id: '81000260', name: 'Diagnóstico por meio de procedimentos laboratoriais', description: 'Substituição ao código Parecer do Estomatologista.', category: ProcedureCategory.IMPLANTE, defaultValue: 88.43, estimatedMinutes: 45 },
  { id: '85100250', name: 'Aplicação de laser terapêutico', description: 'Profilaxia/tratamento de mucosites relacionadas à quimio/radioterapia.', category: ProcedureCategory.IMPLANTE, defaultValue: 181.54, estimatedMinutes: 20 },
  { id: '98010379', name: 'Consulta odontológica domiciliar - PAD - ID', description: 'Internação Domiciliar que necessite atendimento em domicílio.', category: ProcedureCategory.IMPLANTE, defaultValue: 157.97, estimatedMinutes: 60 },
  { id: '98020056', name: 'Consulta odontológica domiciliar - PAD - AD', description: 'Atenção Domiciliar que necessite atendimento em domicílio.', category: ProcedureCategory.IMPLANTE, defaultValue: 157.97, estimatedMinutes: 60 },
  { id: '98010603', name: 'Procedimento Odontológico Domiciliar (Internação)', description: 'Inclui raspagem supragengival, limpeza e aplicação de flúor.', category: ProcedureCategory.IMPLANTE, defaultValue: 281.54, estimatedMinutes: 90 },
  { id: '98020242', name: 'Procedimento Odontológico Domiciliar (Atenção)', description: 'Inclui raspagem supragengival, limpeza e aplicação de flúor.', category: ProcedureCategory.IMPLANTE, defaultValue: 281.54, estimatedMinutes: 90 },
  { id: '82001707', name: 'Ulectomia', description: 'Procedimento cirúrgico que não remove todo o capuz pericoronário.', category: ProcedureCategory.IMPLANTE, defaultValue: 61.43, estimatedMinutes: 30 },
  { id: '82000875', name: 'Exodontia simples de permanente', description: 'Inclui curetagem alveolar, alveoloplastia e sutura.', category: ProcedureCategory.IMPLANTE, defaultValue: 98.59, estimatedMinutes: 45 },
  { id: '82000859', name: 'Exodontia de raiz residual', description: 'Inclui curetagem alveolar e sutura.', category: ProcedureCategory.IMPLANTE, defaultValue: 98.59, estimatedMinutes: 45 },
  { id: '82000816', name: 'Exodontia a retalho', description: 'Técnica cirúrgica alternativa à exodontia simples.', category: ProcedureCategory.IMPLANTE, defaultValue: 118.77, estimatedMinutes: 60 },
  { id: '82000832', name: 'Exodontia de permanente por indicação ortodôntica', description: 'Inclui curetagem alveolar e sutura.', category: ProcedureCategory.IMPLANTE, defaultValue: 71.01, estimatedMinutes: 45 },
  { id: '82000034', name: 'Alveoloplastia', description: 'Justifica em casos de extrações múltiplas.', category: ProcedureCategory.IMPLANTE, defaultValue: 122.56, estimatedMinutes: 40 },
  { id: '82001286', name: 'Remoção de dentes inclusos/impactados', description: 'Inclui retalho, osteotomia e odontossecção.', category: ProcedureCategory.IMPLANTE, defaultValue: 242.69, estimatedMinutes: 90 },
  { id: '82001294', name: 'Remoção de dentes semi-inclusos / impactados', description: 'Inclui retalho, osteotomia e odontossecção.', category: ProcedureCategory.IMPLANTE, defaultValue: 142.89, estimatedMinutes: 60 },
  { id: '82001731', name: 'Exodontia de semi-incluso supranumerário', description: 'Inclui retalho, osteotomia e odontossecção.', category: ProcedureCategory.IMPLANTE, defaultValue: 142.89, estimatedMinutes: 60 },
  { id: '82001740', name: 'Exodontia de incluso supranumerário', description: 'Inclui retalho, osteotomia e odontossecção.', category: ProcedureCategory.IMPLANTE, defaultValue: 242.69, estimatedMinutes: 90 },
  { id: '82000743', name: 'Exérese de lipoma na região buco-maxilo-facial', description: 'Necessário encaminhar laudo histopatológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 174.44, estimatedMinutes: 60 },
  { id: '82000190', name: 'Aprofundamento/aumento de vestíbulo', description: 'Correção cirúrgica de tecidos moles.', category: ProcedureCategory.IMPLANTE, defaultValue: 126.35, estimatedMinutes: 90 },
  { id: '82000441', name: 'Coleta de raspado em lesões', description: 'Exclusivo para as despesas da análise laboratorial.', category: ProcedureCategory.IMPLANTE, defaultValue: 50.51, estimatedMinutes: 20 },
  { id: '82000883', name: 'Frenulectomia labial', description: 'Remoção do freio labial.', category: ProcedureCategory.IMPLANTE, defaultValue: 124.07, estimatedMinutes: 45 },
  { id: '82000905', name: 'Frenulotomia labial', description: 'Corte parcial do freio labial.', category: ProcedureCategory.IMPLANTE, defaultValue: 124.07, estimatedMinutes: 30 },
  { id: '82000891', name: 'Frenulectomia lingual', description: 'Remoção do freio da língua.', category: ProcedureCategory.IMPLANTE, defaultValue: 139.55, estimatedMinutes: 45 },
  { id: '82000913', name: 'Frenulotomia lingual', description: 'Corte parcial do freio da língua.', category: ProcedureCategory.IMPLANTE, defaultValue: 139.55, estimatedMinutes: 30 },
  { id: '82000786', name: 'Exérese ou excisão de cistos odontológicos', description: 'Inclui radiografias e laudo histopatológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 174.44, estimatedMinutes: 90 },
  { id: '82001758', name: 'Marsupialização de cistos odontológicos', description: 'Encaminhar laudo histopatológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 214.18, estimatedMinutes: 90 },
  { id: '82000794', name: 'Exérese ou excisão de mucocele', description: 'Remoção cirúrgica de lesão dos tecidos moles.', category: ProcedureCategory.IMPLANTE, defaultValue: 97.98, estimatedMinutes: 45 },
  { id: '82000808', name: 'Exérese ou excisão de rânula', description: 'Remoção cirúrgica de lesão no assoalho da boca.', category: ProcedureCategory.IMPLANTE, defaultValue: 175.65, estimatedMinutes: 60 },
  { id: '82001103', name: 'Punção aspirativa na região buco-maxilo-facial', description: 'Encaminhar laudo com solicitação do exame.', category: ProcedureCategory.IMPLANTE, defaultValue: 101.62, estimatedMinutes: 20 },
  { id: '82001120', name: 'Punção aspirativa orientada por imagem', description: 'Encaminhar laudo com solicitação do exame.', category: ProcedureCategory.IMPLANTE, defaultValue: 101.62, estimatedMinutes: 30 },
  { id: '82001197', name: 'Redução simples de luxação de ATM', description: 'Passível de realização em ambiente ambulatorial.', category: ProcedureCategory.IMPLANTE, defaultValue: 121.35, estimatedMinutes: 30 },
  { id: '82001642', name: 'Tratamento conservador de luxação da ATM', description: 'Necessário encaminhar laudo que justifique o tratamento.', category: ProcedureCategory.IMPLANTE, defaultValue: 61.26, estimatedMinutes: 45 },
  { id: '81000545', name: 'Diagnóstico e tratamento de trismo', description: 'Tratamento de limitação de abertura bucal.', category: ProcedureCategory.IMPLANTE, defaultValue: 42.08, estimatedMinutes: 45 },
  { id: '82001553', name: 'Tratamento cirúrgico de hiperplasias de tecidos moles', description: 'Remoção de excesso tecidual.', category: ProcedureCategory.IMPLANTE, defaultValue: 174.44, estimatedMinutes: 60 },
  { id: '82001588', name: 'Tratamento cirúrgico de hiperplasias de tecidos ósseos', description: 'Inclui radiografias no procedimento.', category: ProcedureCategory.IMPLANTE, defaultValue: 206.74, estimatedMinutes: 60 },
  { id: '82001596', name: 'Tratamento cirúrgico de tumores benignos (Osseos)', description: 'Necessário encaminhar laudo que justifique o tratamento.', category: ProcedureCategory.IMPLANTE, defaultValue: 206.74, estimatedMinutes: 120 },
  { id: '82001618', name: 'Tratamento cirúrgico de tumores benignos (Moles)', description: 'Necessário encaminhar laudo que justifique o tratamento.', category: ProcedureCategory.IMPLANTE, defaultValue: 174.44, estimatedMinutes: 120 },
  { id: '82000239', name: 'Biópsia de boca', description: 'Encaminhar laudo histopatológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 101.63, estimatedMinutes: 45 },
  { id: '82000247', name: 'Biópsia de glândula salivar', description: 'Encaminhar laudo histopatológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 111.33, estimatedMinutes: 45 },
  { id: '82000255', name: 'Biópsia de lábio', description: 'Encaminhar laudo histopatológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 54.68, estimatedMinutes: 45 },
  { id: '82000263', name: 'Biópsia de língua', description: 'Encaminhar laudo histopatológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 67.82, estimatedMinutes: 45 },
  { id: '82000271', name: 'Biópsia de mandíbula', description: 'Encaminhar laudo histopatológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 151.68, estimatedMinutes: 60 },
  { id: '82000280', name: 'Biópsia de maxila', description: 'Encaminhar laudo histopatológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 104.70, estimatedMinutes: 60 },
  { id: '82001367', name: 'Remoção de odontoma', description: 'Radiografias incluídas no procedimento.', category: ProcedureCategory.IMPLANTE, defaultValue: 242.69, estimatedMinutes: 60 },
  { id: '82001510', name: 'Tratamento cirúrgico das fístulas buco nasal', description: 'Passível de realização em ambiente ambulatorial.', category: ProcedureCategory.IMPLANTE, defaultValue: 170.32, estimatedMinutes: 120 },
  { id: '82001529', name: 'Tratamento cirúrgico das fístulas buco sinusal', description: 'Passível de realização em ambiente ambulatorial.', category: ProcedureCategory.IMPLANTE, defaultValue: 165.34, estimatedMinutes: 120 },
  { id: '82001022', name: 'Incisão e Drenagem extraoral de abscesso', description: 'Hematoma e/ou flegmão da região buco-maxilo-facial.', category: ProcedureCategory.IMPLANTE, defaultValue: 91.01, estimatedMinutes: 30 },
  { id: '82000778', name: 'Exérese ou excisão de cálculo salivar', description: 'Passível de realização em ambiente ambulatorial.', category: ProcedureCategory.IMPLANTE, defaultValue: 147.89, estimatedMinutes: 45 },
  { id: '82001502', name: 'Tracionamento cirúrgico ortodôntico', description: 'Inclui colagem do dispositivo ortodôntico.', category: ProcedureCategory.IMPLANTE, defaultValue: 203.26, estimatedMinutes: 60 },
  { id: '82000395', name: 'Cirurgia para tórus palatino', description: 'Necessário encaminhar laudo que justifique o tratamento.', category: ProcedureCategory.IMPLANTE, defaultValue: 145.61, estimatedMinutes: 60 },
  { id: '82000352', name: 'Cirurgia para exostose maxilar', description: 'Remoção de exostose óssea na maxila.', category: ProcedureCategory.IMPLANTE, defaultValue: 145.61, estimatedMinutes: 60 },
  { id: '82000387', name: 'Cirurgia para tórus mandibular - unilateral', description: 'Necessário encaminhar laudo que justifique o tratamento.', category: ProcedureCategory.IMPLANTE, defaultValue: 145.61, estimatedMinutes: 60 },
  { id: '82000360', name: 'Cirurgia para tórus mandibular - bilateral', description: 'Necessário encaminhar laudo que justifique o tratamento.', category: ProcedureCategory.IMPLANTE, defaultValue: 203.56, estimatedMinutes: 90 },
  { id: '82001251', name: 'Reimplante dentário com contenção', description: 'Inclui utilização de materiais necessários.', category: ProcedureCategory.IMPLANTE, defaultValue: 189.60, estimatedMinutes: 60 },
  { id: '82000298', name: 'Bridectomia', description: 'Dificuldades de inserção e adaptação de próteses.', category: ProcedureCategory.IMPLANTE, defaultValue: 144.10, estimatedMinutes: 45 },
  { id: '82000301', name: 'Bridotomia', description: 'Dificultando a adaptação de próteses.', category: ProcedureCategory.IMPLANTE, defaultValue: 126.81, estimatedMinutes: 45 },
  { id: '82001545', name: 'Tratamento cirúrgico de bridas constritivas', description: 'Novo código.', category: ProcedureCategory.IMPLANTE, defaultValue: 87.92, estimatedMinutes: 45 },
  { id: '82001170', name: 'Redução cruenta de fratura alvéolo dentária', description: 'Inclui esplintagem, material e manutenção.', category: ProcedureCategory.IMPLANTE, defaultValue: 177.01, estimatedMinutes: 90 },
  { id: '82001189', name: 'Redução incruenta de fratura alvéolo dentária', description: 'Inclui esplintagem, material e manutenção.', category: ProcedureCategory.IMPLANTE, defaultValue: 154.71, estimatedMinutes: 90 },
  { id: '82000468', name: 'Controle de hemorragia com agente hemostático', description: 'Tratamento ambulatorial de hemorragias.', category: ProcedureCategory.IMPLANTE, defaultValue: 49.45, estimatedMinutes: 30 },
  { id: '82000484', name: 'Controle de hemorragia sem agente hemostático', description: 'Tratamento ambulatorial de hemorragias.', category: ProcedureCategory.IMPLANTE, defaultValue: 48.53, estimatedMinutes: 30 },
  { id: '82001650', name: 'Tratamento de alveolite', description: 'Inclui eventual uso de agente medicamentoso tópico.', category: ProcedureCategory.IMPLANTE, defaultValue: 49.53, estimatedMinutes: 30 },
  { id: '82001391', name: 'Retirada de corpo estranho oroantral', description: 'Necessário encaminhar laudo que justifique o tratamento.', category: ProcedureCategory.IMPLANTE, defaultValue: 221.15, estimatedMinutes: 120 },
  { id: '82001413', name: 'Retirada de corpo estranho subcutâneo', description: 'Acesso cirúrgico para remoção.', category: ProcedureCategory.IMPLANTE, defaultValue: 70.99, estimatedMinutes: 60 },
  { id: '82001499', name: 'Sutura de ferida em região buco-maxilo-facial', description: 'Inclui sutura na região dos lábios.', category: ProcedureCategory.IMPLANTE, defaultValue: 121.35, estimatedMinutes: 30 },
  { id: '82001766', name: 'Placa de contenção cirúrgica (PDF)', description: 'Planejamento e confecção de guia cirúrgico.', category: ProcedureCategory.IMPLANTE, defaultValue: 208.72, estimatedMinutes: 60 },
  { id: '82001430', name: 'Retirada dos meios de fixação (PDF)', description: 'Passível de realização em ambiente ambulatorial.', category: ProcedureCategory.IMPLANTE, defaultValue: 118.32, estimatedMinutes: 45 },
  { id: '82001308', name: 'Remoção dreno extraoral (PDF)', description: 'Retorno do paciente.', category: ProcedureCategory.IMPLANTE, defaultValue: 30.34, estimatedMinutes: 20 },
  { id: '82001316', name: 'Remoção dreno intraoral (PDF)', description: 'Retorno do paciente.', category: ProcedureCategory.IMPLANTE, defaultValue: 13.01, estimatedMinutes: 20 },
  { id: '82001634', name: 'Tratamento cirúrgico p/ tumores benignos (PDF)', description: 'Sem reconstrução.', category: ProcedureCategory.IMPLANTE, defaultValue: 191.27, estimatedMinutes: 120 },
  { id: '82001154', name: 'Reconstrução de sulco gengivo-labial (PDF)', description: 'Cirurgia de reconstrução visando aumento de rentenção.', category: ProcedureCategory.IMPLANTE, defaultValue: 252.86, estimatedMinutes: 120 },
  { id: '81000189', name: 'Diagnóstico e planejamento p/ implante (PDF)', description: 'Inclui anamnese e exame clínico.', category: ProcedureCategory.IMPLANTE, defaultValue: 78.14, estimatedMinutes: 60 },
  { id: '85500062', name: 'Guia cirúrgico para implante (PDF)', description: 'Confecção do guia cirúrgico.', category: ProcedureCategory.IMPLANTE, defaultValue: 185.81, estimatedMinutes: 60 },
  { id: '82000336', name: 'Cirurgia odontológica a retalho (PDF)', description: 'Substituição aos códigos de enxerto ósseo.', category: ProcedureCategory.IMPLANTE, defaultValue: 409.55, estimatedMinutes: 120 },
  { id: '82000620', name: 'Enxerto com osso liofilizado (PDF)', description: 'Inclui biomateriais e membranas.', category: ProcedureCategory.IMPLANTE, defaultValue: 736.12, estimatedMinutes: 90 },
  { id: '82000581', name: 'Enxerto com osso autógeno (Linha Oblíqua)', description: 'Inclui os acessos cirúrgicos.', category: ProcedureCategory.IMPLANTE, defaultValue: 1473.90, estimatedMinutes: 150 },
  { id: '82000603', name: 'Enxerto com osso autógeno (Mento)', description: 'Inclui os acessos cirúrgicos.', category: ProcedureCategory.IMPLANTE, defaultValue: 1473.90, estimatedMinutes: 150 },
  { id: '82001049', name: 'Levantamento do seio maxilar (Osso Autógeno)', description: 'Inclui biomateriais e membranas.', category: ProcedureCategory.IMPLANTE, defaultValue: 1453.58, estimatedMinutes: 180 },
  { id: '82001057', name: 'Levantamento do seio maxilar (Osso Homólogo)', description: 'Inclui biomateriais e membranas.', category: ProcedureCategory.IMPLANTE, defaultValue: 1453.58, estimatedMinutes: 180 },
  { id: '82000980', name: 'Implante ósseo integrado (PDF)', description: 'Instalação de implante.', category: ProcedureCategory.IMPLANTE, defaultValue: 1086.65, estimatedMinutes: 120 },
  { id: '82001138', name: 'Reabertura - colocação de cicatrizador (PDF)', description: 'Segunda fase cirúrgica.', category: ProcedureCategory.IMPLANTE, defaultValue: 87.68, estimatedMinutes: 45 },
  { id: '82001324', name: 'Remoção de implante dentário (PDF)', description: 'Implantes insatisfatórios.', category: ProcedureCategory.IMPLANTE, defaultValue: 250.00, estimatedMinutes: 60 },
  { id: '85100099', name: 'Restauração de amálgama - 1 face (PDF)', description: 'Recuperar as funções/formas de um dente.', category: ProcedureCategory.IMPLANTE, defaultValue: 55.67, estimatedMinutes: 30 },
  { id: '85100102', name: 'Restauração de amálgama - 2 faces (PDF)', description: 'Recuperar as funções/formas de um dente.', category: ProcedureCategory.IMPLANTE, defaultValue: 75.84, estimatedMinutes: 45 },
  { id: '85100110', name: 'Restauração de amálgama - 3 faces (PDF)', description: 'Recuperar as funções/formas de um dente.', category: ProcedureCategory.IMPLANTE, defaultValue: 83.43, estimatedMinutes: 60 },
  { id: '85100129', name: 'Restauração de amálgama - 4 faces (PDF)', description: 'Recuperar as funções/formas de um dente.', category: ProcedureCategory.IMPLANTE, defaultValue: 88.43, estimatedMinutes: 75 },
  { id: '85100196', name: 'Restauração em resina - 1 face (PDF)', description: 'Inclui forramento e polimento.', category: ProcedureCategory.IMPLANTE, defaultValue: 74.63, estimatedMinutes: 30 },
  { id: '85100200', name: 'Restauração em resina - 2 faces (PDF)', description: 'Inclui forramento e polimento.', category: ProcedureCategory.IMPLANTE, defaultValue: 96.92, estimatedMinutes: 45 },
  { id: '85100218', name: 'Restauração em resina - 3 faces (PDF)', description: 'Inclui forramento e polimento.', category: ProcedureCategory.IMPLANTE, defaultValue: 113.91, estimatedMinutes: 60 },
  { id: '85100226', name: 'Restauração em resina - 4 faces (PDF)', description: 'Inclui forramento e polimento.', category: ProcedureCategory.IMPLANTE, defaultValue: 124.84, estimatedMinutes: 75 },
  { id: '85100048', name: 'Colagem de fragmentos dentários (PDF)', description: 'Utilização de material adesivo.', category: ProcedureCategory.IMPLANTE, defaultValue: 80.09, estimatedMinutes: 45 },
  { id: '83000135', name: 'Restauração atraumática dente decíduo (PDF)', description: 'Ionômero de vidro.', category: ProcedureCategory.IMPLANTE, defaultValue: 37.92, estimatedMinutes: 30 },
  { id: '85100137', name: 'Restauração ionômero de vidro - 1 face (PDF)', description: 'Ionômero de vidro.', category: ProcedureCategory.IMPLANTE, defaultValue: 58.10, estimatedMinutes: 30 },
  { id: '85100145', name: 'Restauração ionômero de vidro - 2 faces (PDF)', description: 'Ionômero de vidro.', category: ProcedureCategory.IMPLANTE, defaultValue: 58.10, estimatedMinutes: 45 },
  { id: '85100153', name: 'Restauração ionômero de vidro - 3 faces (PDF)', description: 'Ionômero de vidro.', category: ProcedureCategory.IMPLANTE, defaultValue: 58.10, estimatedMinutes: 60 },
  { id: '85100161', name: 'Restauração ionômero de vidro - 4 faces (PDF)', description: 'Ionômero de vidro.', category: ProcedureCategory.IMPLANTE, defaultValue: 58.10, estimatedMinutes: 75 },
  { id: '85300012', name: 'Dessensibilização dentária (PDF)', description: 'Tratamento da hipersensibilidade.', category: ProcedureCategory.IMPLANTE, defaultValue: 37.92, estimatedMinutes: 20 },
  { id: '85200085', name: 'Restauração temporária / expectante (PDF)', description: 'Tratamento provisório.', category: ProcedureCategory.IMPLANTE, defaultValue: 32.30, estimatedMinutes: 20 },
  { id: '85100064', name: 'Faceta direta em resina (PDF)', description: 'Favorecer resultado estético.', category: ProcedureCategory.IMPLANTE, defaultValue: 126.55, estimatedMinutes: 90 },
  { id: '87000040', name: 'Coroa de acetato (PDF)', description: 'Dente permanente.', category: ProcedureCategory.IMPLANTE, defaultValue: 122.86, estimatedMinutes: 60 },
  { id: '87000059', name: 'Coroa de aço (PDF)', description: 'Dente permanente.', category: ProcedureCategory.IMPLANTE, defaultValue: 122.86, estimatedMinutes: 60 },
  { id: '87000067', name: 'Coroa de policarbonato (PDF)', description: 'Dente permanente.', category: ProcedureCategory.IMPLANTE, defaultValue: 122.86, estimatedMinutes: 60 },
  { id: '85100013', name: 'Capeamento pulpar direto (PDF)', description: 'Permitir cicatrização pulpar.', category: ProcedureCategory.IMPLANTE, defaultValue: 63.25, estimatedMinutes: 30 },
  { id: '85200166', name: 'Endodontia unirradicular (PDF)', description: 'Tratamento de canal.', category: ProcedureCategory.IMPLANTE, defaultValue: 221.15, estimatedMinutes: 60 },
  { id: '85200140', name: 'Endodontia birradicular (PDF)', description: 'Tratamento de canal.', category: ProcedureCategory.IMPLANTE, defaultValue: 278.04, estimatedMinutes: 90 },
  { id: '85200158', name: 'Endodontia multirradicular (PDF)', description: 'Tratamento de canal.', category: ProcedureCategory.IMPLANTE, defaultValue: 442.46, estimatedMinutes: 120 },
  { id: '85200115', name: 'Retratamento unirradicular (PDF)', description: 'Retratamento de canal.', category: ProcedureCategory.IMPLANTE, defaultValue: 278.04, estimatedMinutes: 90 },
  { id: '85200093', name: 'Retratamento birradicular (PDF)', description: 'Retratamento de canal.', category: ProcedureCategory.IMPLANTE, defaultValue: 331.13, estimatedMinutes: 120 },
  { id: '85200107', name: 'Retratamento multirradicular (PDF)', description: 'Retratamento de canal.', category: ProcedureCategory.IMPLANTE, defaultValue: 530.89, estimatedMinutes: 150 },
  { id: '85200123', name: 'Perfuração endodôntica (PDF)', description: 'Selamento da perfuração.', category: ProcedureCategory.IMPLANTE, defaultValue: 133.94, estimatedMinutes: 60 },
  { id: '85200131', name: 'Endodontia rizogênese incompleta (PDF)', description: 'Apicificação.', category: ProcedureCategory.IMPLANTE, defaultValue: 318.54, estimatedMinutes: 90 },
  { id: '85100056', name: 'Curativo de demora endodontia (PDF)', description: 'Trocas de curativo.', category: ProcedureCategory.IMPLANTE, defaultValue: 76.15, estimatedMinutes: 20 },
  { id: '85200174', name: 'Curativo endodôntico urgência (PDF)', description: 'Especialidade 611.', category: ProcedureCategory.IMPLANTE, defaultValue: 22.79, estimatedMinutes: 20 },
  { id: '85200042', name: 'Pulpotomia (PDF)', description: 'Vitalidade pulpar.', category: ProcedureCategory.IMPLANTE, defaultValue: 67.05, estimatedMinutes: 45 },
  { id: '85200034', name: 'Pulpectomia (PDF)', description: 'Odontalgia aguda.', category: ProcedureCategory.IMPLANTE, defaultValue: 67.05, estimatedMinutes: 45 },
  { id: '85200077', name: 'Remoção núcleo intrarradicular (PDF)', description: 'Retratamento endodôntico.', category: ProcedureCategory.IMPLANTE, defaultValue: 91.01, estimatedMinutes: 45 },
  { id: '85200018', name: 'Clareamento dente desvitalizado (PDF)', description: 'Agente clareador.', category: ProcedureCategory.IMPLANTE, defaultValue: 109.21, estimatedMinutes: 45 },
  { id: '83000127', name: 'Pulpotomia dente decíduo (PDF)', description: 'Dente decíduo.', category: ProcedureCategory.IMPLANTE, defaultValue: 93.59, estimatedMinutes: 30 },
  { id: '82000174', name: 'Apicetomia unirradiculares (PDF)', description: 'Obturação retrógrada.', category: ProcedureCategory.IMPLANTE, defaultValue: 254.07, estimatedMinutes: 90 },
  { id: '82000182', name: 'Apicetomia unirradiculares sem obturação (PDF)', description: 'Sem obturação.', category: ProcedureCategory.IMPLANTE, defaultValue: 216.14, estimatedMinutes: 90 },
  { id: '82000077', name: 'Apicetomia birradiculares (PDF)', description: 'Obturação retrógrada.', category: ProcedureCategory.IMPLANTE, defaultValue: 299.57, estimatedMinutes: 120 },
  { id: '82000085', name: 'Apicetomia birradiculares sem obturação (PDF)', description: 'Sem obturação.', category: ProcedureCategory.IMPLANTE, defaultValue: 260.44, estimatedMinutes: 120 },
  { id: '82000158', name: 'Apicetomia multirradiculares (PDF)', description: 'Obturação retrógrada.', category: ProcedureCategory.IMPLANTE, defaultValue: 353.88, estimatedMinutes: 150 },
  { id: '82000166', name: 'Apicetomia multirradiculares sem obturação (PDF)', description: 'Sem obturação.', category: ProcedureCategory.IMPLANTE, defaultValue: 300.79, estimatedMinutes: 150 },
  { id: '82001030', name: 'Drenagem intraoral abscesso (PDF)', description: 'Punção/incisão.', category: ProcedureCategory.IMPLANTE, defaultValue: 67.05, estimatedMinutes: 30 },
  { id: '85200050', name: 'Corpo estranho intracanal (PDF)', description: 'Remoção.', category: ProcedureCategory.IMPLANTE, defaultValue: 125.13, estimatedMinutes: 60 },
  { id: '85200026', name: 'Preparo núcleo intrarradicular (PDF)', description: 'Novo código.', category: ProcedureCategory.IMPLANTE, defaultValue: 15.78, estimatedMinutes: 30 },
  { id: '85200182', name: 'Curetagem apical (PDF)', description: 'Novo código.', category: ProcedureCategory.IMPLANTE, defaultValue: 15.78, estimatedMinutes: 30 },
  { id: '81000014', name: 'Condicionamento em odontologia (PDF)', description: 'Crianças.', category: ProcedureCategory.IMPLANTE, defaultValue: 52.35, estimatedMinutes: 30 },
  { id: '87000032', name: 'Condicionamento Necessidades Especiais (PDF)', description: 'Pacientes Especiais.', category: ProcedureCategory.IMPLANTE, defaultValue: 52.35, estimatedMinutes: 45 },
  { id: '84000031', name: 'Aplicação cariostático (PDF)', description: 'Dentes decíduos.', category: ProcedureCategory.IMPLANTE, defaultValue: 39.07, estimatedMinutes: 15 },
  { id: '85100080', name: 'Restauração atraumática permanente (PDF)', description: 'Técnica ART.', category: ProcedureCategory.IMPLANTE, defaultValue: 37.99, estimatedMinutes: 45 },
  { id: '83000020', name: 'Coroa acetato dente decíduo (PDF)', description: 'Dente decíduo.', category: ProcedureCategory.IMPLANTE, defaultValue: 126.26, estimatedMinutes: 45 },
  { id: '83000046', name: 'Coroa aço dente decíduo (PDF)', description: 'Dente decíduo.', category: ProcedureCategory.IMPLANTE, defaultValue: 126.26, estimatedMinutes: 45 },
  { id: '83000062', name: 'Coroa policarbonato dente decíduo (PDF)', description: 'Dente decíduo.', category: ProcedureCategory.IMPLANTE, defaultValue: 126.26, estimatedMinutes: 45 },
  { id: '83000151', name: 'Endodontia dente decíduo (PDF)', description: 'Acesso câmara pulpar.', category: ProcedureCategory.IMPLANTE, defaultValue: 130.17, estimatedMinutes: 60 },
  { id: '83000089', name: 'Exodontia simples decíduo (PDF)', description: 'Extração.', category: ProcedureCategory.IMPLANTE, defaultValue: 53.45, estimatedMinutes: 20 },
  { id: '85100242', name: 'Adequação meio bucal (PDF)', description: 'Equilíbrio biológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 67.66, estimatedMinutes: 45 },
  { id: '82000700', name: 'Contenção física/mecânica (PDF)', description: 'Movimentos involuntários.', category: ProcedureCategory.IMPLANTE, defaultValue: 45.32, estimatedMinutes: 30 },
  { id: '87000148', name: 'Contenção física Pacientes Especiais (PDF)', description: 'Movimentos involuntários.', category: ProcedureCategory.IMPLANTE, defaultValue: 45.32, estimatedMinutes: 45 },
  { id: '82001715', name: 'Ulotomia (PDF)', description: 'Incisão na gengiva.', category: ProcedureCategory.IMPLANTE, defaultValue: 57.51, estimatedMinutes: 20 },
  { id: '87000016', name: 'Atividade educativa Especiais (PDF)', description: 'Orientações.', category: ProcedureCategory.IMPLANTE, defaultValue: 48.12, estimatedMinutes: 20 },
  { id: '87000024', name: 'Atividade educativa pais/cuidadores (PDF)', description: 'Orientações.', category: ProcedureCategory.IMPLANTE, defaultValue: 48.12, estimatedMinutes: 20 },
  { id: '84000139', name: 'Atividade educativa saúde bucal (PDF)', description: 'Orientações.', category: ProcedureCategory.IMPLANTE, defaultValue: 48.12, estimatedMinutes: 20 },
  { id: '83000097', name: 'Mantenedor espaço fixo (PDF)', description: 'Aparelho.', category: ProcedureCategory.IMPLANTE, defaultValue: 191.88, estimatedMinutes: 60 },
  { id: '83000100', name: 'Mantenedor espaço removível (PDF)', description: 'Aparelho.', category: ProcedureCategory.IMPLANTE, defaultValue: 191.88, estimatedMinutes: 60 },
  { id: '86000551', name: 'Plano inclinado (PDF)', description: 'Aparelho.', category: ProcedureCategory.IMPLANTE, defaultValue: 192.18, estimatedMinutes: 60 },
  { id: '75050005', name: 'Aparelho passivo reeduc (PDF)', description: 'Hábitos bucais.', category: ProcedureCategory.IMPLANTE, defaultValue: 218.12, estimatedMinutes: 45 },
  { id: '75220008', name: 'Tratamento Parcial parcela 1 (PDF)', description: 'Pacote.', category: ProcedureCategory.IMPLANTE, defaultValue: 261.65, estimatedMinutes: 30 },
  { id: '75230003', name: 'Tratamento Parcial parcela 2 (PDF)', description: 'Pacote.', category: ProcedureCategory.IMPLANTE, defaultValue: 261.65, estimatedMinutes: 30 },
  { id: '75490005', name: 'Tratamento Parcial manutenção (PDF)', description: 'Mensal.', category: ProcedureCategory.IMPLANTE, defaultValue: 80.94, estimatedMinutes: 15 },
  { id: '75300001', name: 'Tratamento tipo I parcela 1 (PDF)', description: 'Pacote.', category: ProcedureCategory.IMPLANTE, defaultValue: 261.65, estimatedMinutes: 30 },
  { id: '75310007', name: 'Tratamento tipo I parcela 2 (PDF)', description: 'Pacote.', category: ProcedureCategory.IMPLANTE, defaultValue: 261.65, estimatedMinutes: 30 },
  { id: '75320002', name: 'Tratamento tipo I parcela 3 (PDF)', description: 'Pacote.', category: ProcedureCategory.IMPLANTE, defaultValue: 261.65, estimatedMinutes: 30 },
  { id: '75500000', name: 'Tratamento tipo I manutenção (PDF)', description: 'Mensal.', category: ProcedureCategory.IMPLANTE, defaultValue: 78.58, estimatedMinutes: 15 },
  { id: '75350009', name: 'Tratamento tipo II parcela 1 (PDF)', description: 'Pacote.', category: ProcedureCategory.IMPLANTE, defaultValue: 837.29, estimatedMinutes: 30 },
  { id: '75360004', name: 'Tratamento tipo II parcela 2 (PDF)', description: 'Pacote.', category: ProcedureCategory.IMPLANTE, defaultValue: 627.96, estimatedMinutes: 30 },
  { id: '75370000', name: 'Tratamento tipo II parcela 3 (PDF)', description: 'Pacote.', category: ProcedureCategory.IMPLANTE, defaultValue: 627.96, estimatedMinutes: 30 },
  { id: '75510006', name: 'Tratamento tipo II manutenção (PDF)', description: 'Mensal.', category: ProcedureCategory.IMPLANTE, defaultValue: 107.39, estimatedMinutes: 15 },
  { id: '82000921', name: 'Gengivectomia (PDF)', description: 'Excisão de gengiva.', category: ProcedureCategory.IMPLANTE, defaultValue: 135.00, estimatedMinutes: 45 },
  { id: '82000948', name: 'Gengivoplastia (PDF)', description: 'Arquitetura normal.', category: ProcedureCategory.IMPLANTE, defaultValue: 135.00, estimatedMinutes: 45 },
  { id: '82000212', name: 'Aumento coroa clínica (PDF)', description: 'Espaço biológico.', category: ProcedureCategory.IMPLANTE, defaultValue: 166.85, estimatedMinutes: 60 },
  { id: '82000557', name: 'Cunha proximal (PDF)', description: 'Gengivectomia papila.', category: ProcedureCategory.IMPLANTE, defaultValue: 114.97, estimatedMinutes: 45 },
  { id: '82000417', name: 'Cirurgia periodontal retalho (PDF)', description: 'Defeitos ósseos.', category: ProcedureCategory.IMPLANTE, defaultValue: 188.40, estimatedMinutes: 90 },
  { id: '85300063', name: 'Abscesso periodontal agudo (PDF)', description: 'Tratamento.', category: ProcedureCategory.IMPLANTE, defaultValue: 67.05, estimatedMinutes: 30 },
  { id: '85300071', name: 'Gengivite necrosante aguda (PDF)', description: 'Sessão única.', category: ProcedureCategory.IMPLANTE, defaultValue: 65.68, estimatedMinutes: 30 },
  { id: '85300080', name: 'Tratamento pericoronarite (PDF)', description: 'Infecção.', category: ProcedureCategory.IMPLANTE, defaultValue: 113.76, estimatedMinutes: 30 },
  { id: '81000197', name: 'Estomatite herpética (PDF)', description: 'Diagnóstico.', category: ProcedureCategory.IMPLANTE, defaultValue: 70.83, estimatedMinutes: 30 },
  { id: '81000200', name: 'Estomatite candidose (PDF)', description: 'Diagnóstico.', category: ProcedureCategory.IMPLANTE, defaultValue: 70.83, estimatedMinutes: 30 },
  { id: '82001073', name: 'Odontossecção (PDF)', description: 'Secção dente.', category: ProcedureCategory.IMPLANTE, defaultValue: 106.18, estimatedMinutes: 45 },
  { id: '82000050', name: 'Amputação radicular obturada (PDF)', description: 'Lesão furca.', category: ProcedureCategory.IMPLANTE, defaultValue: 135.31, estimatedMinutes: 90 },
  { id: '82000069', name: 'Amputação radicular sem obturação (PDF)', description: 'Lesão furca.', category: ProcedureCategory.IMPLANTE, defaultValue: 135.31, estimatedMinutes: 90 },
  { id: '82000689', name: 'Enxerto pediculado (PDF)', description: 'Recessão gengival.', category: ProcedureCategory.IMPLANTE, defaultValue: 166.85, estimatedMinutes: 90 },
  { id: '82000662', name: 'Enxerto gengival livre (PDF)', description: 'Teido conjuntivo.', category: ProcedureCategory.IMPLANTE, defaultValue: 194.61, estimatedMinutes: 90 },
  { id: '85300020', name: 'Imobilização permanente (PDF)', description: 'Trauma.', category: ProcedureCategory.IMPLANTE, defaultValue: 52.17, estimatedMinutes: 45 },
  { id: '85000787', name: 'Imobilização decíduo (PDF)', description: 'Trauma.', category: ProcedureCategory.IMPLANTE, defaultValue: 52.17, estimatedMinutes: 45 },
  { id: '85400246', name: 'Órtese miorrelaxante placa (PDF)', description: 'Bruxismo.', category: ProcedureCategory.IMPLANTE, defaultValue: 272.20, estimatedMinutes: 60 },
  { id: '85400254', name: 'Órtese reposicionadora placa (PDF)', description: 'DTM.', category: ProcedureCategory.IMPLANTE, defaultValue: 264.23, estimatedMinutes: 60 },
  { id: '82001685', name: 'Tunelização (PDF)', description: 'Pós-cirúrgico.', category: ProcedureCategory.IMPLANTE, defaultValue: 166.85, estimatedMinutes: 60 },
  { id: '84000058', name: 'Aplicação selante invasiva (PDF)', description: 'Preparo esmalte.', category: ProcedureCategory.IMPLANTE, defaultValue: 41.71, estimatedMinutes: 20 },
  { id: '84000112', name: 'Aplicação verniz fluoretado (PDF)', description: 'Lesões ativas.', category: ProcedureCategory.IMPLANTE, defaultValue: 60.67, estimatedMinutes: 15 },
  { id: '85400076', name: 'Coroa provisória pino (PDF)', description: 'Reabilitação.', category: ProcedureCategory.IMPLANTE, defaultValue: 78.14, estimatedMinutes: 90 },
  { id: '85400084', name: 'Coroa provisória sem pino (PDF)', description: 'Reabilitação.', category: ProcedureCategory.IMPLANTE, defaultValue: 70.32, estimatedMinutes: 90 },
  { id: '85400220', name: 'Núcleo metálico fundido (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 203.14, estimatedMinutes: 120 },
  { id: '85400211', name: 'Núcleo preenchimento (PDF)', description: 'Restauração.', category: ProcedureCategory.IMPLANTE, defaultValue: 76.88, estimatedMinutes: 45 },
  { id: '85400262', name: 'Pino pré-fabricado (PDF)', description: 'Cimentação.', category: ProcedureCategory.IMPLANTE, defaultValue: 145.79, estimatedMinutes: 60 },
  { id: '85400475', name: 'Reembasamento provisória (PDF)', description: 'Reajuste.', category: ProcedureCategory.IMPLANTE, defaultValue: 35.15, estimatedMinutes: 30 },
  { id: '85400440', name: 'Provisório Inlay/Onlay (PDF)', description: 'Cimentação.', category: ProcedureCategory.IMPLANTE, defaultValue: 70.32, estimatedMinutes: 45 },
  { id: '85400459', name: 'Provisório restauração metálica (PDF)', description: 'Cimentação.', category: ProcedureCategory.IMPLANTE, defaultValue: 70.32, estimatedMinutes: 45 },
  { id: '85400092', name: 'Coroa acrílica prensada (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 182.36, estimatedMinutes: 120 },
  { id: '85400556', name: 'Restauração metálica fundida (PDF)', description: 'Fundição.', category: ProcedureCategory.IMPLANTE, defaultValue: 325.50, estimatedMinutes: 120 },
  { id: '85400149', name: 'Coroa total metálica (PDF)', description: 'Fundição.', category: ProcedureCategory.IMPLANTE, defaultValue: 325.50, estimatedMinutes: 120 },
  { id: '85400173', name: 'Coroa metaloplástica (PDF)', description: 'Prensagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 395.81, estimatedMinutes: 120 },
  { id: '85400157', name: 'Coroa metalocerâmica (PDF)', description: 'Confecção.', category: ProcedureCategory.IMPLANTE, defaultValue: 717.54, estimatedMinutes: 150 },
  { id: '85400360', name: 'Prótese parcial fixa provisória (PDF)', description: 'Nichos.', category: ProcedureCategory.IMPLANTE, defaultValue: 70.32, estimatedMinutes: 120 },
  { id: '85400106', name: 'Coroa cerâmica pura (PDF)', description: 'Confecção.', category: ProcedureCategory.IMPLANTE, defaultValue: 796.93, estimatedMinutes: 150 },
  { id: '85400343', name: 'Prótese fixa metaloplástica (PDF)', description: 'Reabilitação.', category: ProcedureCategory.IMPLANTE, defaultValue: 533.94, estimatedMinutes: 150 },
  { id: '85400335', name: 'Prótese fixa metalocerâmica (PDF)', description: 'Reabilitação.', category: ProcedureCategory.IMPLANTE, defaultValue: 793.03, estimatedMinutes: 150 },
  { id: '85400300', name: 'Prótese fixa adesiva indireta (PDF)', description: 'Metalocerâmica.', category: ProcedureCategory.IMPLANTE, defaultValue: 1000.06, estimatedMinutes: 150 },
  { id: '85400467', name: 'Recimentação protéticos (PDF)', description: 'Retentor.', category: ProcedureCategory.IMPLANTE, defaultValue: 41.72, estimatedMinutes: 30 },
  { id: '85400505', name: 'Remoção trabalho protético (PDF)', description: 'Retentor.', category: ProcedureCategory.IMPLANTE, defaultValue: 41.72, estimatedMinutes: 30 },
  { id: '85400386', name: 'Prótese removível grampos (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 1088.67, estimatedMinutes: 120 },
  { id: '85400416', name: 'Prótese total imediata (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 677.08, estimatedMinutes: 120 },
  { id: '85400408', name: 'Prótese total (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 953.98, estimatedMinutes: 120 },
  { id: '85400041', name: 'Conserto removível consultório (PDF)', description: 'Reparo.', category: ProcedureCategory.IMPLANTE, defaultValue: 102.67, estimatedMinutes: 60 },
  { id: '85400068', name: 'Conserto total consultório (PDF)', description: 'Reparo.', category: ProcedureCategory.IMPLANTE, defaultValue: 102.67, estimatedMinutes: 60 },
  { id: '81000243', name: 'Diagnóstico enceramento (PDF)', description: 'Gesso.', category: ProcedureCategory.IMPLANTE, defaultValue: 56.26, estimatedMinutes: 45 },
  { id: '85400017', name: 'Ajuste Oclusal acréscimo (PDF)', description: 'Sessão.', category: ProcedureCategory.IMPLANTE, defaultValue: 78.14, estimatedMinutes: 30 },
  { id: '85400025', name: 'Ajuste Oclusal desgaste (PDF)', description: 'Sessão.', category: ProcedureCategory.IMPLANTE, defaultValue: 78.14, estimatedMinutes: 30 },
  { id: '85400289', name: 'Prótese adesiva direta (PDF)', description: 'Resina.', category: ProcedureCategory.IMPLANTE, defaultValue: 137.98, estimatedMinutes: 60 },
  { id: '85400394', name: 'Prótese removível provisória (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 425.35, estimatedMinutes: 120 },
  { id: '85400491', name: 'Reembasamento total mediato (PDF)', description: 'Laboratório.', category: ProcedureCategory.IMPLANTE, defaultValue: 199.23, estimatedMinutes: 60 },
  { id: '85400483', name: 'Reembasamento total imediato (PDF)', description: 'Consultório.', category: ProcedureCategory.IMPLANTE, defaultValue: 171.89, estimatedMinutes: 60 },
  { id: '85400033', name: 'Conserto removível laboratório (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 281.27, estimatedMinutes: 60 },
  { id: '85400548', name: 'Restauração cerômero inlay (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 531.29, estimatedMinutes: 120 },
  { id: '85400530', name: 'Restauração cerômero onlay (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 531.29, estimatedMinutes: 120 },
  { id: '85400513', name: 'Restauração cerâmica inlay (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 773.49, estimatedMinutes: 120 },
  { id: '85400521', name: 'Restauração cerâmica onlay (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 773.49, estimatedMinutes: 120 },
  { id: '85400114', name: 'Coroa total cerômero (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 533.94, estimatedMinutes: 120 },
  { id: '85400165', name: 'Coroa metaloplástica cerômero (PDF)', description: 'Moldagem.', category: ProcedureCategory.IMPLANTE, defaultValue: 583.33, estimatedMinutes: 120 },
  { id: '85400599', name: 'Planejamento em prótese (PDF)', description: 'Novo código.', category: ProcedureCategory.IMPLANTE, defaultValue: 78.14, estimatedMinutes: 60 },
  { id: '85500011', name: 'Coroa provisória implante (PDF)', description: 'Laboratório.', category: ProcedureCategory.IMPLANTE, defaultValue: 138.19, estimatedMinutes: 60 },
  { id: '85500020', name: 'Coroa provisória carga imediata (PDF)', description: 'Laboratório.', category: ProcedureCategory.IMPLANTE, defaultValue: 138.19, estimatedMinutes: 90 },
  { id: '85500038', name: 'Coroa metalocerâmica implante (PDF)', description: 'Laboratório.', category: ProcedureCategory.IMPLANTE, defaultValue: 998.53, estimatedMinutes: 120 },
  { id: '85400122', name: 'Coroa metalfree implante (PDF)', description: 'Cerâmica.', category: ProcedureCategory.IMPLANTE, defaultValue: 1133.83, estimatedMinutes: 120 },
  { id: '85500127', name: 'Prótese parcial fixa implanto (PDF)', description: 'Pilar/pôntico.', category: ProcedureCategory.IMPLANTE, defaultValue: 1011.28, estimatedMinutes: 120 },
  { id: '85500097', name: 'Overdenture 2 implantes (PDF)', description: 'Laboratório.', category: ProcedureCategory.IMPLANTE, defaultValue: 2412.97, estimatedMinutes: 180 },
  { id: '85500119', name: 'Overdenture 3 implantes (PDF)', description: 'Laboratório.', category: ProcedureCategory.IMPLANTE, defaultValue: 2595.00, estimatedMinutes: 180 },
  { id: '85500100', name: 'Overdenture 4+ implantes (PDF)', description: 'Laboratório.', category: ProcedureCategory.IMPLANTE, defaultValue: 2758.05, estimatedMinutes: 240 },
  { id: '85500160', name: 'Protocolo Branemark 4 implantes (PDF)', description: 'Reabilitação total.', category: ProcedureCategory.IMPLANTE, defaultValue: 7584.16, estimatedMinutes: 300 },
  { id: '85500178', name: 'Protocolo Branemark 5 implantes (PDF)', description: 'Reabilitação total.', category: ProcedureCategory.IMPLANTE, defaultValue: 7837.01, estimatedMinutes: 300 },
  { id: '81000421', name: 'Radiografia periapical (PDF-PROC)', description: 'Laudo especialista.', category: ProcedureCategory.IMPLANTE, defaultValue: 12.90, estimatedMinutes: 10 },
  { id: '81000383', name: 'Radiografia oclusal (PDF-PROC)', description: 'Laudo especialista.', category: ProcedureCategory.IMPLANTE, defaultValue: 27.00, estimatedMinutes: 10 },
  { id: '81000375', name: 'Radiografia interproximal (PDF-PROC)', description: 'Laudo especialista.', category: ProcedureCategory.IMPLANTE, defaultValue: 12.90, estimatedMinutes: 10 },
  { id: '81000537', name: 'Traçado Cefalométrico (PDF-PROC)', description: 'Desenho técnico.', category: ProcedureCategory.IMPLANTE, defaultValue: 24.27, estimatedMinutes: 30 },
  { id: '81000340', name: 'Radiografia ATM (PDF-PROC)', description: 'Incidências.', category: ProcedureCategory.IMPLANTE, defaultValue: 42.77, estimatedMinutes: 20 },
  { id: '81000294', name: 'Levantamento Radiográfico (PDF-PROC)', description: 'Radiodôntico.', category: ProcedureCategory.IMPLANTE, defaultValue: 106.18, estimatedMinutes: 60 },
  { id: '81000324', name: 'Radiografia ântero-posterior (PDF-PROC)', description: 'Laudo.', category: ProcedureCategory.IMPLANTE, defaultValue: 52.17, estimatedMinutes: 20 },
  { id: '81000430', name: 'Radiografia postero-anterior (PDF-PROC)', description: 'Laudo.', category: ProcedureCategory.IMPLANTE, defaultValue: 52.17, estimatedMinutes: 20 },
  { id: '81000367', name: 'Radiografia carpal (PDF-PROC)', description: 'Laudo.', category: ProcedureCategory.IMPLANTE, defaultValue: 45.51, estimatedMinutes: 20 },
  { id: '81000405', name: 'Radiografia panorâmica (PDF-PROC)', description: 'Laudo.', category: ProcedureCategory.IMPLANTE, defaultValue: 52.33, estimatedMinutes: 20 },
  { id: '81000413', name: 'Radiografia panorâmica c/ traçado (PDF-PROC)', description: 'Implantes.', category: ProcedureCategory.IMPLANTE, defaultValue: 76.60, estimatedMinutes: 30 },
  { id: '81000561', name: 'Radiografia corpo mandíbula (PDF-PROC)', description: 'Novo código.', category: ProcedureCategory.IMPLANTE, defaultValue: 44.23, estimatedMinutes: 20 },
  { id: '81000570', name: 'Localização radiográfica (PDF-PROC)', description: 'Novo código.', category: ProcedureCategory.IMPLANTE, defaultValue: 32.25, estimatedMinutes: 30 },
  { id: '81000472', name: 'Telerradiografia (PDF-PROC)', description: 'Laudo.', category: ProcedureCategory.IMPLANTE, defaultValue: 55.36, estimatedMinutes: 20 },
  { id: '81000480', name: 'Telerradiografia c/ traçado (PDF-PROC)', description: 'Cefalométrico.', category: ProcedureCategory.IMPLANTE, defaultValue: 79.63, estimatedMinutes: 45 },
  { id: '81000510', name: 'Tomografia cone beam sextante (PDF-PROC)', description: 'Laudo.', category: ProcedureCategory.IMPLANTE, defaultValue: 232.53, estimatedMinutes: 30 },
  { id: '81000529', name: 'Tomografia cone beam arcada (PDF-PROC)', description: 'Laudo.', category: ProcedureCategory.IMPLANTE, defaultValue: 334.30, estimatedMinutes: 45 },
  { id: '81000308', name: 'Modelos ortodônticos (PDF-PROC)', description: 'Gesso.', category: ProcedureCategory.IMPLANTE, defaultValue: 75.84, estimatedMinutes: 20 },
  { id: '81000278', name: 'Fotografia (PDF-PROC)', description: 'Documentação.', category: ProcedureCategory.IMPLANTE, defaultValue: 9.10, estimatedMinutes: 15 },
  { id: '84000163', name: 'Controle biofilme (PDF-PROC)', description: 'Placa.', category: ProcedureCategory.IMPLANTE, defaultValue: 10.52, estimatedMinutes: 15 },
  { id: '85300055', name: 'Remoção fatores retenção (PDF-PROC)', description: 'Biofilme.', category: ProcedureCategory.IMPLANTE, defaultValue: 22.82, estimatedMinutes: 30 },
  { id: '84000171', name: 'Controle cárie incipiente (PDF-PROC)', description: 'Alto risco.', category: ProcedureCategory.IMPLANTE, defaultValue: 16.57, estimatedMinutes: 30 },
  { id: '84000201', name: 'Remineralização (PDF-PROC)', description: 'Sessões.', category: ProcedureCategory.IMPLANTE, defaultValue: 44.55, estimatedMinutes: 30 },
  { id: '84000244', name: 'Teste fluxo salivar (PDF-PROC)', description: 'Qualitativo.', category: ProcedureCategory.IMPLANTE, defaultValue: 56.88, estimatedMinutes: 20 },
  { id: '84000252', name: 'Teste Ph salivar (PDF-PROC)', description: 'Qualitativo.', category: ProcedureCategory.IMPLANTE, defaultValue: 56.88, estimatedMinutes: 20 },
  { id: '85300039', name: 'Raspagem sub-gengival (PDF-PROC)', description: 'Segmento.', category: ProcedureCategory.IMPLANTE, defaultValue: 65.23, estimatedMinutes: 45 },
  { id: '85300047', name: 'Raspagem supra-gengival (PDF-PROC)', description: 'Profilaxia.', category: ProcedureCategory.IMPLANTE, defaultValue: 23.06, estimatedMinutes: 30 },
  { id: '84000198', name: 'Polimento coronário (PDF-PROC)', description: 'Mecânicos.', category: ProcedureCategory.IMPLANTE, defaultValue: 53.24, estimatedMinutes: 30 },
  { id: '81000219', name: 'Tratamento halitose (PDF-PROC)', description: 'Anamnese.', category: ProcedureCategory.IMPLANTE, defaultValue: 126.41, estimatedMinutes: 45 },
  { id: '84000074', name: 'Selante fóssulas/fissuras (PDF-PROC)', description: 'Ionoméricos.', category: ProcedureCategory.IMPLANTE, defaultValue: 41.71, estimatedMinutes: 20 },
  { id: '85300098', name: 'Manutenção periodontal (PDF-PROC)', description: 'Revisão.', category: ProcedureCategory.IMPLANTE, defaultValue: 29.13, estimatedMinutes: 30 },
  { id: '84000090', name: 'Aplicação flúor (PDF-PROC)', description: 'Gel.', category: ProcedureCategory.IMPLANTE, defaultValue: 49.29, estimatedMinutes: 15 },
];

const Procedures: React.FC = () => {
  const [procedures, setProcedures] = useState<Procedure[]>(() => {
    const saved = localStorage.getItem('odontoflow_procedures');
    return saved ? JSON.parse(saved) : INITIAL_PROCEDURES;
  });

  useEffect(() => {
    localStorage.setItem('odontoflow_procedures', JSON.stringify(procedures));
  }, [procedures]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Procedure>>({
    name: '',
    description: '',
    category: ProcedureCategory.PREVENCAO,
    defaultValue: 0,
    estimatedMinutes: 30
  });

  const [errors, setErrors] = useState<{ name?: string; category?: string }>({});

  const filteredProcedures = useMemo(() => {
    return procedures.filter(p => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower) ||
        p.id.toLowerCase().includes(searchLower);
        
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [procedures, searchTerm, categoryFilter]);

  const handleOpenModal = (procedure?: Procedure) => {
    setErrors({});
    if (procedure) {
      setEditingProcedure(procedure);
      setFormData(procedure);
    } else {
      setEditingProcedure(null);
      setFormData({
        name: '',
        description: '',
        category: ProcedureCategory.PREVENCAO,
        defaultValue: 0,
        estimatedMinutes: 30
      });
    }
    setIsModalOpen(true);
  };

  const validate = () => {
    const newErrors: { name?: string; category?: string } = {};
    if (!formData.name?.trim()) newErrors.name = 'O nome do procedimento é obrigatório.';
    if (!formData.category) newErrors.category = 'A categoria é obrigatória.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editingProcedure) {
      setProcedures(prev => prev.map(p => p.id === editingProcedure.id ? { ...p, ...formData as Procedure } : p));
    } else {
      const newProcedure: Procedure = {
        ...(formData as Omit<Procedure, 'id'>),
        id: Math.random().toString(36).substr(2, 9),
      };
      setProcedures(prev => [...prev, newProcedure]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este procedimento?')) {
      setProcedures(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tabela de Procedimentos</h1>
          <p className="text-slate-500">Configure os serviços e valores padrão da clínica.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-md hover:bg-sky-600 transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Novo Procedimento
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input 
            type="text" 
            placeholder="Buscar por nome, código ou descrição..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="w-full md:w-64 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Todas as Categorias</option>
          {Object.values(ProcedureCategory).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-widest font-bold border-b border-slate-200">
                <th className="px-6 py-4">Procedimento</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Valor Base</th>
                <th className="px-6 py-4">Tempo Est.</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProcedures.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{p.description}</p>
                      <p className="text-[9px] text-slate-300 font-bold uppercase mt-0.5">Cód: {p.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-bold uppercase tracking-wider">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.defaultValue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <i className="far fa-clock mr-1"></i> {p.estimatedMinutes} min
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Excluir"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Procedimento *</label>
                <input 
                  type="text" 
                  className={`w-full px-4 py-2 border rounded-lg text-sm outline-none transition-all ${errors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-2 focus:ring-sky-500'}`}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Limpeza, Canal..."
                />
                {errors.name && <p className="mt-1 text-[10px] text-rose-500 font-bold">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição / Observações</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none h-20"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes sobre o serviço..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria *</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as ProcedureCategory })}
                  >
                    {Object.values(ProcedureCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tempo Est. (Min)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    value={formData.estimatedMinutes}
                    onChange={e => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Base (R$)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.defaultValue}
                  onChange={e => setFormData({ ...formData, defaultValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-semibold text-slate-600">Cancelar</button>
              <button onClick={handleSave} className="px-8 py-2 bg-sky-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-sky-100 hover:bg-sky-600 transition-all">
                {editingProcedure ? 'Salvar Alterações' : 'Criar Procedimento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Procedures;