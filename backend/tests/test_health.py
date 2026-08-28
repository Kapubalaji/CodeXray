from app.main import health_check, get_stages

def test_health_check():
    res = health_check()
    assert res.status == "ok"
    assert res.service == "codexray-backend"

def test_get_stages():
    res = get_stages()
    assert len(res.stages) == 7
    assert res.stages[0].id == "source"

