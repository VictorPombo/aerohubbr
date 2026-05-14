-- ========================================================================================
-- SPRINT 2: DIÁRIO DE BORDO E AUTOMAÇÃO DE HORAS (TRIGGERS)
-- ========================================================================================

-- 1. Adicionar o Tempo de Motor na tabela de voos, já que antes só tínhamos o tempo de voo
ALTER TABLE public.flight_logs 
ADD COLUMN IF NOT EXISTS engine_time NUMERIC(5, 2);

-- 2. Criar a função que fará a matemática exata baseada nos horários
CREATE OR REPLACE FUNCTION public.update_aircraft_hours()
RETURNS TRIGGER AS $$
DECLARE
    v_engine_time NUMERIC;
    v_old_engine_time NUMERIC;
BEGIN
    -- Se for INSERT: Adiciona as horas
    IF TG_OP = 'INSERT' THEN
        -- Calcula o tempo de motor decimal: (stop - start) em segundos / 3600
        v_engine_time := EXTRACT(EPOCH FROM (NEW.engine_stop - NEW.engine_start)) / 3600.0;
        
        -- Atualiza a aeronave somando o novo tempo (no airframe e no motor)
        UPDATE public.aircraft
        SET 
            total_airframe_hours = COALESCE(total_airframe_hours, 0) + v_engine_time,
            total_engine_hours = COALESCE(total_engine_hours, 0) + v_engine_time
        WHERE id = NEW.aircraft_id;
        
        RETURN NEW;
    END IF;

    -- Se for DELETE: Subtrai as horas
    IF TG_OP = 'DELETE' THEN
        v_engine_time := EXTRACT(EPOCH FROM (OLD.engine_stop - OLD.engine_start)) / 3600.0;
        
        -- Atualiza a aeronave subtraindo o tempo do voo deletado
        UPDATE public.aircraft
        SET 
            total_airframe_hours = GREATEST(0, COALESCE(total_airframe_hours, 0) - v_engine_time),
            total_engine_hours = GREATEST(0, COALESCE(total_engine_hours, 0) - v_engine_time)
        WHERE id = OLD.aircraft_id;
        
        RETURN OLD;
    END IF;

    -- Se for UPDATE: Ajusta a diferença entre o valor antigo e o novo
    IF TG_OP = 'UPDATE' THEN
        v_old_engine_time := EXTRACT(EPOCH FROM (OLD.engine_stop - OLD.engine_start)) / 3600.0;
        v_engine_time := EXTRACT(EPOCH FROM (NEW.engine_stop - NEW.engine_start)) / 3600.0;
        
        -- Só atualiza se houver diferença no tempo ou se mudou de aeronave
        IF (v_old_engine_time != v_engine_time) OR (OLD.aircraft_id != NEW.aircraft_id) THEN
            
            -- Se mudou a aeronave (corrigiu um lançamento errado de prefixo)
            IF OLD.aircraft_id != NEW.aircraft_id THEN
                -- Subtrai da velha
                UPDATE public.aircraft
                SET 
                    total_airframe_hours = GREATEST(0, COALESCE(total_airframe_hours, 0) - v_old_engine_time),
                    total_engine_hours = GREATEST(0, COALESCE(total_engine_hours, 0) - v_old_engine_time)
                WHERE id = OLD.aircraft_id;
                
                -- Soma na nova
                UPDATE public.aircraft
                SET 
                    total_airframe_hours = COALESCE(total_airframe_hours, 0) + v_engine_time,
                    total_engine_hours = COALESCE(total_engine_hours, 0) + v_engine_time
                WHERE id = NEW.aircraft_id;
            ELSE
                -- Se é a mesma aeronave, apenas aplica a diferença (novo - velho)
                UPDATE public.aircraft
                SET 
                    total_airframe_hours = GREATEST(0, COALESCE(total_airframe_hours, 0) + (v_engine_time - v_old_engine_time)),
                    total_engine_hours = GREATEST(0, COALESCE(total_engine_hours, 0) + (v_engine_time - v_old_engine_time))
                WHERE id = NEW.aircraft_id;
            END IF;
        END IF;
        
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Associar a função à tabela (Trigger)
DROP TRIGGER IF EXISTS trg_update_aircraft_hours ON public.flight_logs;
CREATE TRIGGER trg_update_aircraft_hours
AFTER INSERT OR UPDATE OR DELETE ON public.flight_logs
FOR EACH ROW EXECUTE PROCEDURE public.update_aircraft_hours();
